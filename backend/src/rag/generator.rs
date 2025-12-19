/// Generator module - orchestrates the final response generation
/// For now, this delegates to IBM Granite. Can be extended for prompt engineering.

use crate::services::ibm_granite;

pub async fn generate(query: &str, context: &str, image: Option<String>) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
    ibm_granite::generate_response(query, context, image).await
}
