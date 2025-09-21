ARG TARGET=x86_64-unknown-linux-musl

FROM ghcr.io/profiidev/images/rust-musl-builder:main AS planner

COPY backend/entity/Cargo.toml ./entity/Cargo.toml
COPY backend/migration/Cargo.toml ./migration/Cargo.toml
COPY backend/derive-util/Cargo.toml ./derive-util/Cargo.toml
COPY backend/Cargo.toml ./Cargo.lock ./

RUN echo "[workspace]" >> Cargo.toml && \
    echo "members = [\"entity\", \"migration\", \"derive-util\"]" >> Cargo.toml

RUN cargo chef prepare --recipe-path recipe.json --bin backend

FROM ghcr.io/profiidev/images/rust-musl-builder:main AS builder

ARG TARGET
ENV TARGET=$TARGET

COPY --from=planner /app/recipe.json .

RUN cargo chef cook --release --target $TARGET

COPY backend/src ./src
COPY backend/entity ./entity
COPY backend/migration ./migration
COPY backend/derive-util ./derive-util
COPY backend/Cargo.toml ./Cargo.lock ./

RUN cargo build --release --target $TARGET --bin backend
RUN mv ./target/$TARGET/release/backend ./app

FROM alpine

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

WORKDIR /app
COPY --from=builder /app/app /usr/local/bin/

CMD ["app"]