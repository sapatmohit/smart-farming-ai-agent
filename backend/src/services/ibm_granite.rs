use serde_json::json;
use reqwest::Client;
use std::env;
use log::error;

pub async fn generate_response(prompt: &str) -> Result<String, Box<dyn std::error::Error>> {
    let api_key = env::var("IBM_CLOUD_API_KEY")?;
    let project_id = env::var("IBM_PROJECT_ID")?;
    let model_id = env::var("IBM_GRANITE_MODEL_ID").unwrap_or("ibm/granite-13b-chat-v2".to_string());
    
    // Placeholder URL - Replace with actual IBM Cloud WatsonX AI endpoint
    let url = "https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29";

    let client = Client::new();
    let token = crate::services::ibm_cloud::get_iam_token(&api_key).await?;

    let body = json!({
        "model_id": model_id,
        "project_id": project_id,
        "input": prompt,
        "parameters": {
            "decoding_method": "greedy",
            "max_new_tokens": 200,
            "min_new_tokens": 0,
            "stop_sequences": [],
            "repetition_penalty": 1.0
        }
    });

    let res = client.post(url)
        .header("Authorization", format!("Bearer {}", token))
        .header("Content-Type", "application/json")
        .header("Accept", "application/json")
        .json(&body)
        .send()
        .await?;

    if res.status().is_success() {
        let json_resp: serde_json::Value = res.json().await?;
        // Adjust parsing based on actual response structure
        let generated_text = json_resp["results"][0]["generated_text"].as_str().unwrap_or("").to_string();
        Ok(generated_text)
    } else {
        error!("IBM Granite API Error: {:?}", res.text().await?);
        Err("Failed to generate response".into())
    }
}
