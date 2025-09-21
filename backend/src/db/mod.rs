use std::{ops::Deref, time::Duration};

use axum::Extension;
use derive_util::FromReqExtension;
use migration::MigratorTrait;
use sea_orm::{ConnectOptions, DatabaseConnection};
use tables::Tables;

use crate::{config::Config, router_extension};

pub mod tables;

#[derive(Debug, FromReqExtension, Clone)]
pub struct DB(DatabaseConnection);

impl Deref for DB {
  type Target = DatabaseConnection;

  fn deref(&self) -> &Self::Target {
    &self.0
  }
}

pub trait DBTrait {
  fn tables(&self) -> Tables<'_>;
}

impl DBTrait for DatabaseConnection {
  fn tables(&self) -> Tables<'_> {
    Tables::new(self)
  }
}

router_extension!(
  async fn db(self, config: &Config) -> Self {
    let mut options = ConnectOptions::new(&config.db_url);
    options
      .max_connections(1024)
      .min_connections(0)
      .connect_timeout(Duration::from_secs(5))
      .sqlx_logging(config.db_logging);

    let conn = sea_orm::Database::connect(options)
      .await
      .expect("Failed to connect to database");
    migration::Migrator::up(&conn, None)
      .await
      .expect("Failed to run migrations");

    self.layer(Extension(DB(conn)))
  }
);
