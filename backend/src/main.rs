use actix_web::{web, App, HttpServer, HttpResponse, Responder};
use dotenv::dotenv;
use log::info;

mod api;
mod rag;
mod services;
mod utils;

async fn health_check() -> impl Responder {
    HttpResponse::Ok().body("Smart Farming AI Agent Backend is Running 🚀")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    utils::logger::init();

    let port = std::env::var("BACKEND_PORT").unwrap_or_else(|_| "8080".to_string());
    let addr = format!("0.0.0.0:{}", port);

    info!("Starting server at http://{}", addr);

    HttpServer::new(|| {
        App::new()
            .route("/", web::get().to(health_check))
            .service(
                web::scope("/api")
                    .configure(api::config)
            )
    })
    .bind(addr)?
    .run()
    .await
}
