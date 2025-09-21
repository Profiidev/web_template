use axum::{Extension, Router, routing::get};
use derive_util::FromReqExtension;

use crate::{
  db::{DB, DBTrait},
  error::Result,
  router_extension,
};

pub fn router() -> Router {
  Router::new().route("/test", get(test))
}

router_extension!(
  async fn dummy(self) -> Self {
    self.layer(Extension(TestState::default()))
  }
);

async fn test(test: TestState, db: DB) -> Result<String> {
  let test_model = match db.tables().dummy().load().await {
    Ok(t) => t,
    Err(_) => {
      db.tables().dummy().save().await?;
      db.tables().dummy().load().await?
    }
  };

  Ok(format!("{} - {}", test_model.test, test.test))
}

#[derive(Clone, FromReqExtension)]
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
