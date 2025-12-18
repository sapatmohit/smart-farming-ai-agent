use serde_json::json;
use reqwest::Client;
use std::env;
use tracing::{info, error, warn};

/// IBM Granite LLM integration via Replicate API
/// Uses Replicate's hosted IBM Granite models for text generation

const SYSTEM_PROMPT: &str = r#"You are an expert agricultural advisor helping Indian farmers with accurate, localized, and practical advice.

RULES:
1. Never hallucinate or make up data - only use information from the provided context
2. Prefer government and trusted agricultural sources (ICAR, IMD, State Agriculture Departments)
3. Explain in simple, farmer-friendly language that villagers can understand
4. Provide actionable steps that farmers can immediately implement
5. If you don't have enough information, admit it and suggest where to find help
6. Always consider the Indian agricultural context (seasons, local crops, mandi system)
7. Be helpful, respectful, and supportive

FORMAT:
- Use simple bullet points for steps
- Include specific quantities and timings when available
- Mention local names of crops/pests when relevant"#;

const REPLICATE_API_URL: &str = "https://api.replicate.com/v1/predictions";

pub async fn generate_response(query: &str, context: &str) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
    let api_token = env::var("REPLICATE_API_TOKEN").map_err(|_| "REPLICATE_API_TOKEN not set")?;
    
    // Use IBM Granite 3.0 8B Instruct model on Replicate
    let model_version = env::var("REPLICATE_MODEL_VERSION")
        .unwrap_or_else(|_| "ibm-granite/granite-3.0-8b-instruct".to_string());

    let client = Client::new();

    // Build the prompt with context
    let user_prompt = if context.is_empty() {
        format!("Farmer's Question: {}\n\nPlease provide helpful farming advice based on your knowledge.", query)
    } else {
        format!(
            "CONTEXT FROM KNOWLEDGE BASE:\n{}\n\n---\n\nFarmer's Question: {}\n\nBased on the context above, please provide accurate and helpful farming advice.",
            context, query
        )
    };

    let full_prompt = format!("{}\n\nUser: {}\nAssistant:", SYSTEM_PROMPT, user_prompt);

    info!("Calling Replicate API with IBM Granite model");

    // Create prediction request
    let body = json!({
        "version": model_version,
        "input": {
            "prompt": full_prompt,
            "max_tokens": 500,
            "temperature": 0.7,
            "top_p": 0.9,
            "stop_sequences": "User:,\n\nUser"
        }
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
