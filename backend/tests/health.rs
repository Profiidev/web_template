mod common;

use common::TestServer;

#[tokio::test]
async fn health_check_returns_success() {
  let server = TestServer::start().await;

  let resp = server.get("/health").await;
  assert!(resp.status().is_success());
}

#[tokio::test]
async fn protected_route_without_auth_is_rejected() {
  let server = TestServer::start().await;

  // `/user/info` requires a valid auth cookie; without one it must not 2xx.
  let resp = server.get("/user/info/").await;
  assert!(!resp.status().is_success());
}
