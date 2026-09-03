//! Coverage for the only application endpoint this template ships:
//! `GET /dummy/test` (`dummy.rs` + `db/dummy.rs`). It lazily seeds a `dummy`
//! row on first hit and echoes `"<row.test> - <state.test>"`.

mod common;

use common::TestServer;
use reqwest::StatusCode;

#[tokio::test]
async fn dummy_test_seeds_a_row_and_echoes_it_with_the_state_string() {
  let server = TestServer::start().await;

  let resp = server.get("/dummy/test").await;
  assert_eq!(resp.status(), StatusCode::OK);
  assert_eq!(resp.text().await.unwrap(), "Test - test");
}

#[tokio::test]
async fn dummy_test_is_stable_across_repeated_calls() {
  let server = TestServer::start().await;

  let first = server.get("/dummy/test").await.text().await.unwrap();
  let second = server.get("/dummy/test").await.text().await.unwrap();

  assert_eq!(first, "Test - test");
  assert_eq!(second, first);
}

#[tokio::test]
async fn dummy_test_needs_no_authentication() {
  let server = TestServer::start().await;
  server.clear_cookies();

  let resp = server.get("/dummy/test").await;
  assert!(resp.status().is_success());
}
