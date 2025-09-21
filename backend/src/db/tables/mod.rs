use sea_orm::DatabaseConnection;

use crate::db::tables::dummy::DummyTable;

mod dummy;

pub struct Tables<'db> {
  db: &'db DatabaseConnection,
}

impl<'db> Tables<'db> {
  pub fn new(db: &'db DatabaseConnection) -> Self {
    Self { db }
  }

  pub fn dummy(self) -> DummyTable<'db> {
    DummyTable::new(self.db)
  }
}
