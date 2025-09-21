use migration::MigratorTrait;
use pool::SeaOrmPool;
use rocket::{
  fairing::{self, AdHoc},
  Build, Rocket,
};
use sea_orm::DatabaseConnection;
use sea_orm_rocket::Database;
use tables::Tables;

mod pool;
pub mod tables;

#[derive(Database, Debug)]
#[database("sea_orm")]
pub struct DB(SeaOrmPool);

impl DB {
  pub fn attach(rocket: Rocket<Build>) -> Rocket<Build> {
    rocket
      .attach(DB::init())
      .attach(AdHoc::try_on_ignite("Migrations", run_migrations))
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

async fn run_migrations(rocket: Rocket<Build>) -> fairing::Result {
  let conn = &DB::fetch(&rocket).unwrap().conn;
  let _ = migration::Migrator::up(conn, None).await;
  Ok(rocket)
}
