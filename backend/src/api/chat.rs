use axum::{Json, http::StatusCode};
use serde::{Deserialize, Serialize};
use tracing::{info, error};

use crate::rag::{retriever, generator};
use crate::services::translator;

#[derive(Deserialize)]
pub struct ChatRequest {
    pub query: String,
    pub language: Option<String>, // "en", "hi", "mr"
    pub image: Option<String>,    // Base64 encoded image or URL
}

#[derive(Serialize)]
pub struct ChatResponse {
    pub answer: String,
    pub sources: Vec<String>,
    pub confidence: String, // "low", "medium", "high"
    pub detected_language: String,
}

#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: String,
}

pub async fn chat_handler(
    Json(payload): Json<ChatRequest>,
) -> Result<Json<ChatResponse>, (StatusCode, Json<ErrorResponse>)> {
    let original_query = payload.query.trim().to_string();
    let user_lang = payload.language.unwrap_or_else(|| "en".to_string());
    
    info!("Received query: '{}' in language: {}", original_query, user_lang);

    if original_query.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse { error: "Query cannot be empty".to_string() })
        ));
    }

    // Step 1: Detect language and translate to English if needed
    let detected_lang = translator::detect_language(&original_query);
    let query_in_english = if detected_lang != "en" {
        translator::translate_to_english(&original_query, &detected_lang)
    } else {
        original_query.clone()
    };

    info!("Detected language: {}, Query in English: '{}'", detected_lang, query_in_english);

    // Step 2: Retrieve relevant context from knowledge base
    let (context_docs, sources) = retriever::retrieve(&query_in_english).await;
    let context = context_docs.join("\n\n");

    info!("Retrieved {} relevant documents", sources.len());

    // Step 3: Generate response using IBM Granite (via RAG generator)
    // We pass the desired language directly to the LLM
    let final_response = match generator::generate(&query_in_english, &context, payload.image, &user_lang).await {
        Ok(response) => response,
        Err(e) => {
            error!("IBM Granite error: {:?}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse { error: "Failed to generate response".to_string() })
            ));
        }
    };

    // Step 4: No post-translation needed, LLM generates in target language directly

    // Step 5: Calculate confidence based on context matches
    let confidence = if sources.len() >= 3 {
        "high"
    } else if sources.len() >= 1 {
        "medium"
    } else {
        "low"
    };

    Ok(Json(ChatResponse {
        answer: final_response,
        sources,
        confidence: confidence.to_string(),
        detected_language: detected_lang,
    }))
}
