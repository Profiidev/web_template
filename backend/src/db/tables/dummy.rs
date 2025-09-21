use entity::{dummy, prelude::*};
use sea_orm::{prelude::*, ActiveValue::Set};

pub struct DummyTable<'db> {
  db: &'db DatabaseConnection,
}

impl<'db> DummyTable<'db> {
  pub fn new(db: &'db DatabaseConnection) -> Self {
    Self { db }
  }

  pub async fn save(&self) -> Result<(), DbErr> {
    let model = dummy::ActiveModel {
      test: Set("Test".into()),
      ..Default::default()
    };

    model.insert(self.db).await?;

    Ok(())
  }

  pub async fn load(&self) -> Result<dummy::Model, DbErr> {
    let res = Dummy::find()
      .one(self.db)
      .await?
      .ok_or(DbErr::RecordNotFound("Dummy".into()))?;

    Ok(res)
  }
}
