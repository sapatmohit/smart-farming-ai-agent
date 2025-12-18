use actix_web::{HttpResponse, Responder, web};
use serde::{Deserialize, Serialize};
use crate::services::ibm_granite;
use crate::rag::generator;

#[derive(Deserialize)]
pub struct ChatRequest {
    pub message: String,
    pub language: Option<String>,
}

#[derive(Serialize)]
pub struct ChatResponse {
    pub response: String,
}

pub async fn chat_handler(req: web::Json<ChatRequest>) -> impl Responder {
    // 1. Retrieve context (RAG) - Placeholder for now
    // let context = crate::rag::retriever::retrieve(&req.message).await;
    
    // 2. Generate response using IBM Granite
    let response_text = match ibm_granite::generate_response(&req.message).await {
        Ok(text) => text,
        Err(_) => "Sorry, I am unable to process your request at the moment.".to_string(),
    };

    HttpResponse::Ok().json(ChatResponse {
        response: response_text,
    })
}
