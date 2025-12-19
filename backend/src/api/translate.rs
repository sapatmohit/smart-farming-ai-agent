use axum::{Json, http::StatusCode};
use serde::{Deserialize, Serialize};
use tracing::{info, error};
use crate::services::ibm_granite;

#[derive(Deserialize)]
pub struct TranslateRequest {
    pub text: String,
    pub target_lang: String,
}

#[derive(Serialize)]
pub struct TranslateResponse {
    pub translated_text: String,
}

#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: String,
}

pub async fn translate_handler(
    Json(payload): Json<TranslateRequest>,
) -> Result<Json<TranslateResponse>, (StatusCode, Json<ErrorResponse>)> {
    
    info!("Translating text to: {}", payload.target_lang);

    // We can reuse the generate_response function but with empty context
    // and a specific prompt to just translate
    let prompt = format!(
        "Translate the following text to {}. Return ONLY the translated text, no explanations.\n\nText: {}", 
        match payload.target_lang.as_str() {
            "hi" => "Hindi",
            "mr" => "Marathi",
            _ => "English"
        },
        payload.text
    );

    // We leverage the generalized model for translation
    // Passing None for image and the target lang
    let result = ibm_granite::generate_response(&prompt, "", None, &payload.target_lang).await;

    match result {
        Ok(translated) => Ok(Json(TranslateResponse { translated_text: translated })),
        Err(e) => {
            error!("Translation error: {:?}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse { error: "Translation failed".to_string() })
            ))
        }
    }
}
