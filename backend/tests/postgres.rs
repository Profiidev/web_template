//! Full-stack tests against a real postgres (testcontainers) instead of sqlite.
//!
//! Booting the app covers centaurus `init_db` on postgres (including every
//! migration), and the dummy endpoint hits the `dummy` table.
mod common;

use common::TestServer;
use reqwest::StatusCode;

#[tokio::test]
async fn pg_boot_and_dummy_roundtrip() {
  let server = TestServer::start_pg().await;

  let resp = server.get("/dummy/test").await;
  assert_eq!(resp.status(), StatusCode::OK);
  assert_eq!(resp.text().await.unwrap(), "Test - test");

  // second hit reads the row seeded in postgres
  let resp = server.get("/dummy/test").await;
  assert_eq!(resp.text().await.unwrap(), "Test - test");
}
