use axum::{
  Extension, Router,
  body::Body,
  extract::{FromRequestParts, Request},
  response::{IntoResponse, Response},
  routing::get,
};
use centaurus::router_extension;
use http::StatusCode;
use hyper_util::{client::legacy::connect::HttpConnector, rt::TokioExecutor};
use tracing::instrument;

pub fn router() -> Router {
  Router::new()
    .route("/{*p}", get(handler))
    .route("/", get(handler))
}

router_extension!(
  async fn frontend(self) -> Self {
    #[cfg(not(debug_assertions))]
    let frontend_dir = env!("FRONTEND_DIR");

    #[cfg(not(debug_assertions))]
    let frontend_url = env!("FRONTEND_URL");
    #[cfg(debug_assertions)]
    let frontend_url = "http://frontend:5173";

    #[cfg(not(debug_assertions))]
    let handle = tokio::process::Command::new("node")
      .arg(".")
      .current_dir(frontend_dir)
      .kill_on_drop(true)
      .spawn()
      .expect("Failed to start frontend server");

    self.layer(Extension(FrontendState {
      client: hyper_util::client::legacy::Client::<(), ()>::builder(TokioExecutor::new())
        .build(HttpConnector::new()),
      frontend_url,
      #[cfg(not(debug_assertions))]
      _handle: std::sync::Arc::new(handle),
    }))
  }
);

type Client = hyper_util::client::legacy::Client<HttpConnector, Body>;

#[derive(FromRequestParts, Clone, Debug)]
#[from_request(via(Extension))]
struct FrontendState {
  client: Client,
  frontend_url: &'static str,
  #[cfg(not(debug_assertions))]
  _handle: std::sync::Arc<tokio::process::Child>,
}

#[instrument(level = "trace", skip(state, req))]
async fn handler(state: FrontendState, mut req: Request) -> Result<Response, StatusCode> {
  tracing::trace!("Forwarding request to frontend: {}", req.uri());
  let path = req.uri().path();
  let path_query = req
    .uri()
    .path_and_query()
    .map(|pq| pq.as_str())
    .unwrap_or(path);

  let uri = format!("{}{}", state.frontend_url, path_query);
  *req.uri_mut() = uri.parse().map_err(|_| StatusCode::BAD_REQUEST)?;

  Ok(
    state
      .client
      .request(req)
      .await
      .map_err(|_| StatusCode::BAD_GATEWAY)?
      .into_response(),
  )
}
