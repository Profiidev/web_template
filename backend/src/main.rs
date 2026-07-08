#[cfg(debug_assertions)]
use dotenvy::dotenv;

#[tokio::main]
async fn main() {
  #[cfg(debug_assertions)]
  dotenv().ok();

  backend::serve().await;
}
