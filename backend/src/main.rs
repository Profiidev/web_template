use std::net::SocketAddr;

use axum::{Extension, Router, serve};
use clap::Parser;
#[cfg(debug_assertions)]
use dotenv::dotenv;
use tokio::{net::TcpListener, signal};

use crate::{config::Config, cors::cors};

mod config;
mod cors;
mod db;
mod dummy;
mod error;
mod logging;
mod macros;

#[tokio::main]
async fn main() {
  #[cfg(debug_assertions)]
  dotenv().ok();

  let config = Config::parse();
  tracing_subscriber::fmt()
    .with_max_level(config.log_level)
    .init();

  let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
  let listener = TcpListener::bind(addr)
    .await
    .expect("Failed to bind to address");

  let app = router().state(&config).await.layer(Extension(config));

  serve(listener, app)
    .with_graceful_shutdown(shutdown_signal())
    .await
    .expect("Server failed");
}

fn router() -> Router {
  dummy::router()
}

router_extension!(
  async fn state(self, config: &Config) -> Self {
    use db::db;
    use dummy::dummy;
    use logging::logging;

    self
      .db(config)
      .await
      .layer(cors(config).expect("Failed to create CORS layer"))
      .logging()
      .await
      .dummy()
      .await
  }
);

async fn shutdown_signal() {
  let ctrl_c = async {
    signal::ctrl_c()
      .await
      .expect("failed to install Ctrl+C handler");
  };

  let terminate = async {
    signal::unix::signal(signal::unix::SignalKind::terminate())
      .expect("failed to install signal handler")
      .recv()
      .await;
  };

  tokio::select! {
      _ = ctrl_c => {},
      _ = terminate => {},
  }
}
