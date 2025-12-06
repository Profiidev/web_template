use axum::{Extension, Router};
use centaurus::{
  db::init::init_db,
  init::{
    axum::{add_base_layers, listener_setup, run_app},
    logging::init_logging,
    metrics::{init_metrics, metrics, metrics_route},
  },
  req::health,
  router_extension,
};
#[cfg(debug_assertions)]
use dotenv::dotenv;
use tracing::info;

use crate::config::Config;

mod config;
mod db;
mod dummy;
mod frontend;

#[tokio::main]
async fn main() {
  #[cfg(debug_assertions)]
  dotenv().ok();

  let config = Config::parse();
  init_logging(&config.base);
  let handle = init_metrics(config.metrics_name.clone());

  let metrics_name = config.metrics_name.clone();

  let listener = listener_setup(config.base.port).await;

  let app = router(&config)
    .await
    .state(config)
    .await
    .metrics(metrics_name, handle, vec![])
    .await;

  info!("Starting application");
  run_app(listener, app).await;
}

async fn router(config: &Config) -> Router {
  frontend::router()
    .nest("/api", api_router().await)
    .add_base_layers_filtered(&config.base, |path| path.starts_with("/api"))
    .await
}

async fn api_router() -> Router {
  Router::new()
    .merge(dummy::router())
    .merge(health::router())
    .metrics_route()
    .await
}

router_extension!(
  async fn state(self, config: Config) -> Self {
    use dummy::dummy;

    let db = init_db::<migration::Migrator>(&config.db, &config.db_url).await;

    self
      .dummy()
      .await
      .layer(Extension(db))
      .layer(Extension(config))
  }
);
