use axum::{
    Router,
    routing::get,
    http::Method,
};
use tower_http::cors::{CorsLayer, Any};
use tracing::info;
use std::net::SocketAddr;

mod api;
mod rag;
mod services;
mod utils;

async fn health_check() -> &'static str {
    "Smart Farming AI Agent Backend is Running 🚀"
}

#[tokio::main]
async fn main() {
    // Load environment variables
    dotenvy::dotenv().ok();
    
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info".into())
        )
        .init();

    // CORS configuration
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers(Any);

    // Build router
    let app = Router::new()
        .route("/health", get(health_check))
        .nest("/api", api::router())
        .layer(cors);

    // Get port from env or default
    let port: u16 = std::env::var("BACKEND_PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse()
        .unwrap_or(8080);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    info!("🌾 Smart Farming AI Backend starting on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
