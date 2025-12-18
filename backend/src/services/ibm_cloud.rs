use reqwest::Client;
use serde_json::Value;
use tracing::{info, error};
use std::sync::OnceLock;
use tokio::sync::RwLock;

/// Token cache to avoid repeated IAM calls
static TOKEN_CACHE: OnceLock<RwLock<Option<CachedToken>>> = OnceLock::new();

#[derive(Clone)]
struct CachedToken {
    token: String,
    expires_at: std::time::Instant,
}

fn get_cache() -> &'static RwLock<Option<CachedToken>> {
    TOKEN_CACHE.get_or_init(|| RwLock::new(None))
}

/// Get IAM token for IBM Cloud authentication
/// Caches the token for efficiency
pub async fn get_iam_token(api_key: &str) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
    let cache = get_cache();
    
    // Check cache first
    {
        let cached = cache.read().await;
        if let Some(ref t) = *cached {
            if t.expires_at > std::time::Instant::now() {
                return Ok(t.token.clone());
            }
        }
    }

    info!("Fetching new IAM token from IBM Cloud");

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
        let token = json["access_token"]
            .as_str()
            .ok_or("No access token in response")?
            .to_string();
        
        // Cache for 55 minutes (tokens typically last 60 minutes)
        let expires_at = std::time::Instant::now() + std::time::Duration::from_secs(55 * 60);
        
        {
            let mut cached = cache.write().await;
            *cached = Some(CachedToken {
                token: token.clone(),
                expires_at,
            });
        }

        info!("Successfully obtained IAM token");
        Ok(token)
    } else {
        let status = res.status();
        let error_text = res.text().await.unwrap_or_default();
        error!("Failed to get IAM token: {} - {}", status, error_text);
        Err(format!("IAM Token Error: {} - {}", status, error_text).into())
    }
}
