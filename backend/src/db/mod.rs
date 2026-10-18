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

#[cfg(test)]
mod test {
  use centaurus::db::init::Connection;
  use migration::{Migrator, MigratorTrait};
  use sea_orm::{ConnectionTrait, Database, DatabaseBackend, Statement};
  use testcontainers_modules::{
    postgres::Postgres,
    testcontainers::{ContainerAsync, ImageExt, runners::AsyncRunner},
  };

  /// Starts a throwaway Postgres container (same major version as production)
  /// and runs all migrations on it.
  ///
  /// The container must be kept alive for the duration of the test; dropping it
  /// stops and removes postgres.
  async fn test_pg_db() -> (Connection, ContainerAsync<Postgres>) {
    let container = Postgres::default()
      .with_tag("18-alpine")
      .start()
      .await
      .expect("Failed to start postgres container");
    let url = format!(
      "postgres://postgres:postgres@{}:{}/postgres",
      container.get_host().await.unwrap(),
      container.get_host_port_ipv4(5432).await.unwrap()
    );

    let conn = Database::connect(url)
      .await
      .expect("Failed to connect to postgres");

    Migrator::up(&conn, None)
      .await
      .expect("Failed to run database migrations");

    (Connection(conn), container)
  }

  async fn pg_table_exists(conn: &Connection, name: &str) -> bool {
    conn
      .query_one_raw(Statement::from_sql_and_values(
        DatabaseBackend::Postgres,
        "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1",
        [name.into()],
      ))
      .await
      .unwrap()
      .is_some()
  }

  #[tokio::test]
  async fn pg_migrations_down_then_up() {
    let (conn, _pg) = test_pg_db().await;
    assert!(pg_table_exists(&conn, "dummy").await);

    // every migration's `down` must work on postgres
    Migrator::down(&conn.0, None).await.unwrap();
    assert!(!pg_table_exists(&conn, "dummy").await);

    Migrator::up(&conn.0, None).await.unwrap();
    assert!(pg_table_exists(&conn, "dummy").await);
  }
}
