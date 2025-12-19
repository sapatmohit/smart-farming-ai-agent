use axum::Router;
use axum::routing::post;

pub mod chat;
pub mod translate;

pub fn router() -> Router {
    Router::new()
        .route("/chat", post(chat::chat_handler))
        .route("/translate", post(translate::translate_handler))
}
