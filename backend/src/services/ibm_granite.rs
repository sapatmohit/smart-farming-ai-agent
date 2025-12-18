use serde_json::json;
use reqwest::Client;
use std::env;
use tracing::{info, error};

/// IBM Granite LLM integration for Smart Farming AI Agent
/// Uses IBM WatsonX AI API for text generation

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

pub async fn generate_response(query: &str, context: &str) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
    let api_key = env::var("IBM_CLOUD_API_KEY").map_err(|_| "IBM_CLOUD_API_KEY not set")?;
    let project_id = env::var("IBM_PROJECT_ID").map_err(|_| "IBM_PROJECT_ID not set")?;
    let model_id = env::var("IBM_GRANITE_MODEL_ID").unwrap_or_else(|_| "ibm/granite-13b-chat-v2".to_string());
    let region = env::var("IBM_REGION").unwrap_or_else(|_| "us-south".to_string());
    
    let url = format!("https://{}.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29", region);

    let client = Client::new();
    let token = super::ibm_cloud::get_iam_token(&api_key).await?;

    // Build the prompt with context
    let user_prompt = if context.is_empty() {
        format!("Farmer's Question: {}\n\nPlease provide helpful farming advice based on your knowledge.", query)
    } else {
        format!(
            "CONTEXT FROM KNOWLEDGE BASE:\n{}\n\n---\n\nFarmer's Question: {}\n\nBased on the context above, please provide accurate and helpful farming advice.",
            context, query
        )
    };

    let body = json!({
        "model_id": model_id,
        "project_id": project_id,
        "input": format!("{}\n\nUser: {}\nAssistant:", SYSTEM_PROMPT, user_prompt),
        "parameters": {
            "decoding_method": "greedy",
            "max_new_tokens": 500,
            "min_new_tokens": 50,
            "stop_sequences": ["User:", "\n\nUser"],
            "repetition_penalty": 1.1,
            "temperature": 0.7
        }
    });

    info!("Calling IBM Granite API with model: {}", model_id);

    let res = client.post(&url)
        .header("Authorization", format!("Bearer {}", token))
        .header("Content-Type", "application/json")
        .header("Accept", "application/json")
        .json(&body)
        .send()
        .await?;

    if res.status().is_success() {
        let json_resp: serde_json::Value = res.json().await?;
        
        // Parse the response structure
        let generated_text = json_resp["results"]
            .get(0)
            .and_then(|r| r["generated_text"].as_str())
            .unwrap_or("I apologize, but I couldn't generate a response. Please try again.")
            .trim()
            .to_string();

        info!("Successfully generated response ({} chars)", generated_text.len());
        Ok(generated_text)
    } else {
        let status = res.status();
        let error_text = res.text().await.unwrap_or_default();
        error!("IBM Granite API Error ({}): {}", status, error_text);
        Err(format!("IBM API Error: {} - {}", status, error_text).into())
    }
}

/// Fallback response when IBM API is not available
pub fn get_fallback_response(query: &str, context: &str) -> String {
    if context.is_empty() {
        format!(
            "I understand you're asking about: \"{}\"\n\n\
             Unfortunately, I couldn't find specific information in my knowledge base. \
             Please contact your local Krishi Vigyan Kendra (KVK) or dial 1551 for Kisan Call Center \
             for personalized farming advice.",
            query
        )
    } else {
        format!(
            "Based on available information:\n\n{}\n\n\
             For more detailed advice, please visit your nearest agricultural office or \
             contact the Kisan Call Center at 1551.",
            context
        )
    }
}
