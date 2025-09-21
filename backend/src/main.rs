use cors::cors;
use db::DB;
#[cfg(debug_assertions)]
use dotenv::dotenv;
use fern::Dispatch;
use rocket::{
  fairing::{self, AdHoc},
  launch, Build, Config, Rocket, Route,
};
use sea_orm_rocket::Database;

mod cors;
mod db;
mod dummy;
mod error;

#[launch]
async fn rocket() -> _ {
  #[cfg(debug_assertions)]
  dotenv().ok();

  let level = std::env::var("RUST_LOG")
    .unwrap_or("warn".into())
    .parse()
    .expect("Failed to parse RUST_LOG");

  Dispatch::new()
    .chain(Box::new(env_logger::builder().build()) as Box<dyn log::Log>)
    .level(level)
    .apply()
    .expect("Failed to initialize logger");

  let cors = cors();

  let url = std::env::var("DB_URL").expect("Failed to load DB_URL");
  let sqlx_logging = std::env::var("DB_LOGGING")
    .map(|s| s.parse::<bool>().unwrap_or(false))
    .unwrap_or(false);

  let figment = Config::figment()
    .merge(("address", "0.0.0.0"))
    .merge(("log_level", "normal"))
    .merge((
      "databases.sea_orm",
      sea_orm_rocket::Config {
        url,
        min_connections: None,
        max_connections: 1024,
        connect_timeout: 5,
        idle_timeout: None,
        sqlx_logging,
      },
    ));

  let server = rocket::custom(figment)
    .attach(cors)
    .manage(rocket_cors::catch_all_options_routes())
    .mount("/", routes());

  let server = state(server);
  DB::attach(server).attach(AdHoc::try_on_ignite("DB States init", init_state_with_db))
}

fn routes() -> Vec<Route> {
  dummy::routes().into_iter().collect()
}

fn state(server: Rocket<Build>) -> Rocket<Build> {
  dummy::state(server)
}

async fn init_state_with_db(server: Rocket<Build>) -> fairing::Result {
  let db = &DB::fetch(&server).unwrap().conn;

  Ok(server)
}
