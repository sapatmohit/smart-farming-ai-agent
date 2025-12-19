use serde_json::json;
use reqwest::Client;
use std::env;
use tracing::{info, error, warn};

/// IBM Granite LLM integration via Replicate API
/// Uses Replicate's hosted IBM Granite models for text generation

const SYSTEM_PROMPT: &str = r#"You are KisanAI, a helpful and knowledgeable AI assistant.

Your primary goal is to help users with accurate and practical information. While you have a special focus on agriculture and helping farmers, you can answer questions on a wide range of topics including general knowledge, science, history, and daily life.

GUIDELINES:
1. **Be Helpful & Accurate**: Provide clear, correct, and useful answers.
2. **Context Matters**: Use the provided context from the knowledge base to answer properly. If the context is relevant, prioritize it.
3. **General Knowledge**: If the query is not about farming, answer it using your general knowledge.
4. **Farming Persona**: When answering agricultural questions, use simple, farmer-friendly language and consider the Indian context (seasons, mandis, crops).
5. **Safety**: Do not generate harmful, illegal, or biased content.

FORMAT:
- Use bullet points for lists.
- Be concise and direct.
- For farming advice, include actionable steps."#;

const REPLICATE_API_URL: &str = "https://api.replicate.com/v1/predictions";

pub async fn generate_response(query: &str, context: &str, image: Option<String>) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
    let api_token = env::var("REPLICATE_API_TOKEN").map_err(|_| "REPLICATE_API_TOKEN not set")?;

    // Determine model based on image presence
    let (model_version, is_vision) = if image.is_some() {
        // Use a vision-capable model (e.g., LLaVA or newer Granite Vision if available)
        // Using LLaVA v1.6 Mistral 7B standard version for robustness
        (
            env::var("REPLICATE_VISION_MODEL").unwrap_or_else(|_| "yorickvp/llava-13b:b5f6212d2d740c28fbb5478fb01693df32d0c22822a93866917f5f84d2621a5b".to_string()),
            true
        )
    } else {
        // Default text-only model
        (
            env::var("REPLICATE_MODEL_VERSION").unwrap_or_else(|_| "ibm-granite/granite-3.0-8b-instruct".to_string()),
            false
        )
    };

    let client = Client::new();

    // Prepare prompt
    let user_suffix = if is_vision { "" } else { "User: " };
    let assistant_prefix = if is_vision { "" } else { "Assistant:" };
    
    // RAG Context Integration
    let context_block = if context.is_empty() {
        String::new()
    } else {
        format!("CONTEXT FROM KNOWLEDGE BASE:\n{}\n\n---\n\n", context)
    };

    // Prompt construction depends on model expectations, but we generally mix system prompt + context + query
    let final_prompt = if is_vision {
        // LLaVA usually takes a single prompt string
        format!("{}\n\n{}{}", SYSTEM_PROMPT, context_block, query)
    } else {
        // Granite Instruct format
        let user_msg = format!("{}{}", context_block, query);
        format!("{}\n\n{}{}\n{}", SYSTEM_PROMPT, user_suffix, user_msg, assistant_prefix)
    };

    info!("Calling Replicate API with model: {} (Vision: {})", model_version, is_vision);

    // Build Payload
    let mut input_obj = serde_json::Map::new();
    input_obj.insert("prompt".to_string(), json!(final_prompt));
    input_obj.insert("max_tokens".to_string(), json!(500));
    input_obj.insert("temperature".to_string(), json!(0.7));
    input_obj.insert("top_p".to_string(), json!(0.9));
    
    if let Some(img_data) = image {
        input_obj.insert("image".to_string(), json!(img_data));
    }

    // Granite specific params
    if !is_vision {
         input_obj.insert("stop_sequences".to_string(), json!("User:,\n\nUser"));
    }

    let body = json!({
        "version": model_version,
        "input": input_obj
    });

    let res = client.post(REPLICATE_API_URL)
        .header("Authorization", format!("Bearer {}", api_token))
        .header("Content-Type", "application/json")
        .header("Prefer", "wait")  // Wait for result synchronously
        .json(&body)
        .send()
        .await?;

    if res.status().is_success() || res.status().as_u16() == 201 {
        let json_resp: serde_json::Value = res.json().await?;
        
        // Check if prediction is completed
        let status = json_resp["status"].as_str().unwrap_or("unknown");
        
        if status == "succeeded" {
            // Get the output
            let output = if let Some(output_array) = json_resp["output"].as_array() {
                output_array.iter()
                    .filter_map(|v| v.as_str())
                    .collect::<Vec<&str>>()
                    .join("")
            } else if let Some(output_str) = json_resp["output"].as_str() {
                output_str.to_string()
            } else {
                return Ok(get_fallback_response(query, context));
            };

            info!("Successfully generated response ({} chars)", output.len());
            Ok(output.trim().to_string())
        } else if status == "processing" || status == "starting" {
            // Need to poll for result
            if let Some(get_url) = json_resp["urls"]["get"].as_str() {
                poll_for_result(&client, get_url, &api_token).await
            } else {
                warn!("No polling URL available, using fallback");
                Ok(get_fallback_response(query, context))
            }
        } else {
            warn!("Prediction failed with status: {}", status);
            Ok(get_fallback_response(query, context))
        }
    } else {
        let status = res.status();
        let error_text = res.text().await.unwrap_or_default();
        error!("Replicate API Error ({}): {}", status, error_text);
        
        // Return fallback response instead of error
        Ok(get_fallback_response(query, context))
    }
}

/// Poll Replicate API for prediction result
async fn poll_for_result(client: &Client, url: &str, api_token: &str) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
    for attempt in 0..30 {  // Max 30 attempts (30 seconds)
        tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
        
        let res = client.get(url)
            .header("Authorization", format!("Bearer {}", api_token))
            .send()
            .await?;

        if res.status().is_success() {
            let json_resp: serde_json::Value = res.json().await?;
            let status = json_resp["status"].as_str().unwrap_or("unknown");

            match status {
                "succeeded" => {
                    let output = if let Some(output_array) = json_resp["output"].as_array() {
                        output_array.iter()
                            .filter_map(|v| v.as_str())
                            .collect::<Vec<&str>>()
                            .join("")
                    } else if let Some(output_str) = json_resp["output"].as_str() {
                        output_str.to_string()
                    } else {
                        "I apologize, but I couldn't generate a response.".to_string()
                    };
                    return Ok(output.trim().to_string());
                }
                "failed" | "canceled" => {
                    warn!("Prediction {} after {} attempts", status, attempt);
                    break;
                }
                _ => continue,  // Still processing
            }
        }
    }

    Ok("I apologize, but the response is taking too long. Please try again.".to_string())
}

/// Fallback response when API is not available
pub fn get_fallback_response(query: &str, context: &str) -> String {
    if context.is_empty() {
        format!(
            "I understand you're asking about: \"{}\"\n\n\
             Based on general farming knowledge:\n\
             • Contact your local Krishi Vigyan Kendra (KVK) for personalized advice\n\
             • Call 1551 (Kisan Call Center) for free 24x7 assistance\n\
             • Visit your nearest agricultural office for soil testing and recommendations\n\n\
             I'm currently unable to provide a detailed AI response. Please try again later.",
            query
        )
    } else {
        format!(
            "Based on available information from our knowledge base:\n\n{}\n\n\
             For more detailed and personalized advice:\n\
             • Contact Kisan Call Center: 1551 (Free, 24x7)\n\
             • Visit your nearest Krishi Vigyan Kendra",
            context
        )
    }
}
