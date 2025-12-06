use centaurus::db::init::Connection;

use crate::db::dummy::DummyTable;

pub mod dummy;

pub trait DBTrait {
  fn dummy(&self) -> DummyTable<'_>;
}

impl DBTrait for Connection {
  fn dummy(&self) -> DummyTable<'_> {
    DummyTable::new(self)
  }
}
