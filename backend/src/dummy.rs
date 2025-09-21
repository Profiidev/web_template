use rocket::{get, Build, Rocket, Route, State};

pub fn routes() -> Vec<Route> {
  rocket::routes![test]
}

pub fn state(server: Rocket<Build>) -> Rocket<Build> {
  server.manage(TestState {})
}

#[get("/test")]
fn test(test: &State<TestState>) {}

struct TestState {}
