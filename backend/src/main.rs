use aide::axum::ApiRouter;
use axum::Extension;
use centaurus::{
  backend::{
    init::{listener_setup, run_app_connect_info},
    middleware::rate_limiter::RateLimiter,
    router::build_router,
  },
  db::init::init_db,
  logging::init_logging,
  version_header,
};
#[cfg(debug_assertions)]
use dotenvy::dotenv;
use tracing::info;

use crate::config::Config;

mod config;
mod db;
mod dummy;

#[tokio::main]
async fn main() {
  #[cfg(debug_assertions)]
  dotenv().ok();

  let config = Config::parse();
  init_logging(config.base.log_level);

  let listener = listener_setup(config.base.port).await;
  let mut app = build_router(api_router, state, config).await;
  version_header!(app);

  info!("Starting application");
  run_app_connect_info(listener, app).await;
}

fn api_router(_rate_limiter: &mut RateLimiter) -> ApiRouter {
  ApiRouter::new().nest("/dummy", dummy::router())
}

async fn state(router: ApiRouter, config: Config) -> ApiRouter {
  let db = init_db::<migration::Migrator>(&config.db, &config.db_url).await;

  let router = dummy::state(router);

  router.layer(Extension(db))
}
