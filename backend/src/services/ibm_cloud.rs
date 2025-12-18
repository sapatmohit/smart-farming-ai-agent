use reqwest::Client;
use serde_json::Value;

pub async fn get_iam_token(api_key: &str) -> Result<String, Box<dyn std::error::Error>> {
    let client = Client::new();
    let res = client.post("https://iam.cloud.ibm.com/identity/token")
        .header("Content-Type", "application/x-www-form-urlencoded")
        .header("Accept", "application/json")
        .form(&[
            ("grant_type", "urn:ibm:params:oauth:grant-type:apikey"),
            ("apikey", api_key)
        ])
        .send()
        .await?;

    if res.status().is_success() {
        let json: Value = res.json().await?;
        let token = json["access_token"].as_str().ok_or("No access token found")?;
        Ok(token.to_string())
    } else {
        Err("Failed to retrieve IAM token".into())
    }
}
