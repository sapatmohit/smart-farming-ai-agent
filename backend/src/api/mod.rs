use actix_web::web;

pub mod chat;

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::resource("/chat").route(web::post().to(chat::chat_handler))
    );
}
