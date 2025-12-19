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

// using model-specific endpoint to always get latest version
// URL format: https://api.replicate.com/v1/models/{owner}/{model}/predictions

pub async fn generate_response(query: &str, context: &str, image: Option<String>, target_lang: &str) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
    let api_token = env::var("REPLICATE_API_TOKEN").map_err(|_| "REPLICATE_API_TOKEN not set")?;

    // Determine model (Owner/Name format)
    let (model_id, is_vision) = if image.is_some() {
        (
            env::var("REPLICATE_VISION_MODEL").unwrap_or_else(|_| "yorickvp/llava-13b".to_string()),
            true
        )
    } else {
        (
            {
                // User requested specific active model: ibm-granite/granite-3.3-8b-instruct
                let env_model = env::var("REPLICATE_MODEL_VERSION").unwrap_or_else(|_| "ibm-granite/granite-3.3-8b-instruct".to_string());
                
                // Override disabled/older versions to the new 3.3 version
                if env_model.contains("granite-3.0-8b-instruct") || env_model.contains("granite-34b-code-instruct") {
                    warn!("Switching to active Granite 3.3 8B Instruct model.");
                    "ibm-granite/granite-3.3-8b-instruct".to_string()
                } else {
                    env_model
                }
            },
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

    let lang_instruction = match target_lang {
        "hi" => "IMPORTANT: Respond in Hindi (Devanagari script).",
        "mr" => "IMPORTANT: Respond in Marathi (Devanagari script).",
        _ => "IMPORTANT: Respond in English."
    };

    // Prompt construction
    let final_prompt = if is_vision {
        // LLaVA format
        format!("{}\n\n{}\n{}\n{}", SYSTEM_PROMPT, lang_instruction, context_block, query)
    } else {
        // Granite Instruct format
        let user_msg = format!("{}\n{}\n{}", context_block, query, lang_instruction);
        format!("{}\n\n{}{}\n{}", SYSTEM_PROMPT, user_suffix, user_msg, assistant_prefix)
    };

    info!("Calling Replicate API with model: {} (Vision: {})", model_id, is_vision);

    // Build Payload (No version field needed for model endpoint)
    let mut input_obj = serde_json::Map::new();
    input_obj.insert("prompt".to_string(), json!(final_prompt));
    input_obj.insert("max_tokens".to_string(), json!(500)); // Updated back to max_tokens per user snippet
    input_obj.insert("temperature".to_string(), json!(0.7));
    input_obj.insert("top_p".to_string(), json!(0.9));
    
    if let Some(img_data) = image {
        input_obj.insert("image".to_string(), json!(img_data));
    }

    if !is_vision {
         input_obj.insert("stop_sequences".to_string(), json!("User:,\n\nUser"));
    }

    let body = json!({
        "input": input_obj
    });

    let url = format!("https://api.replicate.com/v1/models/{}/predictions", model_id);

    let res = client.post(&url)
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
                return Ok(get_fallback_response(query, context, target_lang));
            };

            info!("Successfully generated response ({} chars)", output.len());
            Ok(output.trim().to_string())
        } else if status == "processing" || status == "starting" {
            // Need to poll for result
            if let Some(get_url) = json_resp["urls"]["get"].as_str() {
                poll_for_result(query, &client, get_url, &api_token, target_lang).await
            } else {
                warn!("No polling URL available, using fallback");
                Ok(get_fallback_response(query, context, target_lang))
            }
        } else {
            warn!("Prediction failed with status: {}", status);
            Ok(get_fallback_response(query, context, target_lang))
        }
    } else {
        let status = res.status();
        let error_text = res.text().await.unwrap_or_default();
        error!("Replicate API Error ({}) for model {}: {}", status, model_id, error_text);
        
        // Return fallback response instead of error
        Ok(get_fallback_response(query, context, target_lang))
    }
}

/// Poll Replicate API for prediction result
async fn poll_for_result(query: &str, client: &Client, url: &str, api_token: &str, target_lang: &str) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
    info!("Polling for result at: {}", url);
    for attempt in 0..90 {  // Max 90 attempts (90 seconds) for cold boots
        tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
        
        let res = client.get(url)
            .header("Authorization", format!("Bearer {}", api_token))
            .send()
            .await?;

        if res.status().is_success() {
            let json_resp: serde_json::Value = res.json().await?;
            let status = json_resp["status"].as_str().unwrap_or("unknown");
            
            if attempt % 5 == 0 {
                info!("Poll attempt {}: Status = {}", attempt, status);
            }

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
                         // Greeting check if LLM returns empty
                        if is_greeting(query) {
                             return Ok(get_greeting(target_lang));
                        }
                        match target_lang {
                           "hi" => "क्षमा करें, मैं प्रतिक्रिया उत्पन्न नहीं कर सका।".to_string(),
                           "mr" => "क्षमस्व, मी प्रतिसाद देऊ शकलो नाही.".to_string(),
                           _ => "I apologize, but I couldn't generate a response.".to_string()
                        }
                    };
                    return Ok(output.trim().to_string());
                }
                "failed" | "canceled" => {
                    let error_msg = json_resp["error"].as_str().unwrap_or("Unknown error");
                    error!("Prediction API failed: {}", error_msg);
                    warn!("Prediction {} after {} attempts. Error: {}", status, attempt, error_msg);
                    break;
                }
                _ => continue,  // Still processing
            }
        } else {
             error!("Poll request failed: {}", res.status());
        }
    }

    warn!("Polling timed out after 90 seconds");
    // On timeout, if it's a greeting, return greeting!
    // We don't have query here cleanly, but we can assume fallback handles it
    Ok(match target_lang {
        "hi" => "क्षमा करें, प्रतिक्रिया में बहुत समय लग रहा है। कृपया पुनः प्रयास करें।".to_string(),
        "mr" => "क्षमस्व, प्रतिसादास खूप वेळ लागत आहे. कृपया पुन्हा प्रयत्न करा.".to_string(),
        _ => "I apologize, but the response is taking too long. Please try again.".to_string()
    })
}

fn is_greeting(text: &str) -> bool {
    let lower = text.trim().to_lowercase();
    matches!(lower.as_str(), "hello" | "hi" | "hey" | "namaste" | "namaskar" | "ram ram" | "sat sri akal" | "greetings")
}

fn get_greeting(lang: &str) -> String {
    match lang {
        "hi" => "नमस्ते! मैं किसानAI हूँ। मैं आपकी खेती में कैसे सहायता कर सकता हूँ?".to_string(),
        "mr" => "नमस्कार! मी किसानAI आहे. मी तुम्हाला शेतीत कशी मदत करू शकतो?".to_string(),
        _ => "Hello! I am KisanAI. How can I help you with your farming today?".to_string()
    }
}

/// Fallback response when API is not available
pub fn get_fallback_response(query: &str, context: &str, target_lang: &str) -> String {
    // Check for greetings first
    if is_greeting(query) {
        return get_greeting(target_lang);
    }

    let (intro, contact, error_msg) = match target_lang {
        "hi" => (
            "हमारे ज्ञान के आधार पर:",
            "अधिक विस्तृत जानकारी के लिए:\n• किसान कॉल सेंटर: 1551 (निःशुल्क)\n• अपने नजदीकी कृषि विज्ञान केंद्र पर जाएं",
            "मुझे क्षमा करें, मैं अभी विस्तृत उत्तर देने में असमर्थ हूं। कृपया बाद में प्रयास करें।"
        ),
        "mr" => (
            "आमच्या माहितीनुसार:",
            "अधिक सविस्तर माहितीसाठी:\n• किसान कॉल सेंटर: 1551 (मोफत)\n• आपल्या जवळच्या कृषी विज्ञान केंद्रास भेट द्या",
            "क्षमस्व, मी आता सविस्तर उत्तर देऊ शकत नाही. कृपया नंतर पुन्हा प्रयत्न करा."
        ),
        _ => (
            "Based on available information from our knowledge base:",
            "For more detailed and personalized advice:\n• Contact Kisan Call Center: 1551 (Free, 24x7)\n• Visit your nearest Krishi Vigyan Kendra",
            "I'm currently unable to provide a detailed AI response. Please try again later."
        )
    };

    if context.is_empty() {
        format!("{}\n\n{}\n\n{}\n\n{}", 
            match target_lang {
                "hi" => "मैं समझता हूं कि आप इसके बारे में पूछ रहे हैं:",
                "mr" => "मला समजले की आपण याबद्दल विचारत आहात:",
                _ => "I understand you're asking about:"
            },
            query, contact, error_msg
        )
    } else {
        format!("{}\n\n{}\n\n{}", intro, context, contact)
    }
}
