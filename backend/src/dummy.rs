use aide::{
  OperationIo,
  axum::{ApiRouter, routing::get_with},
};
use axum::{Extension, extract::FromRequestParts};
use centaurus::{db::init::Connection, error::Result};

use crate::db::DBTrait;

pub fn router() -> ApiRouter {
  ApiRouter::new().api_route("/test", get_with(test, |op| op.id("test")))
}

pub fn state(router: ApiRouter) -> ApiRouter {
  router.layer(Extension(TestState::default()))
}

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

#[derive(Clone, FromRequestParts, OperationIo)]
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
