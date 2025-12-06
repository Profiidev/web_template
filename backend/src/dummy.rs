use axum::{Extension, Router, extract::FromRequestParts, routing::get};
use centaurus::{db::init::Connection, error::Result, router_extension};

use crate::db::DBTrait;

pub fn router() -> Router {
  Router::new().route("/test", get(test))
}

router_extension!(
  async fn dummy(self) -> Self {
    self.layer(Extension(TestState::default()))
  }
);

async fn test(test: TestState, db: Connection) -> Result<String> {
  let test_model = match db.dummy().load().await {
    Ok(t) => t,
    Err(_) => {
      db.dummy().save().await?;
      db.dummy().load().await?
    }
  };

  Ok(format!("{} - {}", test_model.test, test.test))
}

#[derive(Clone, FromRequestParts)]
#[from_request(via(Extension))]
struct TestState {
  test: String,
}

impl Default for TestState {
  fn default() -> Self {
    Self {
      test: "test".to_string(),
    }
  }
}
