ARG TARGETARCH
# If TARGETARCH is amd64, result is x86_64. If arm64, result is aarch64.
ARG RUST_ARCH=${TARGETARCH/amd64/x86_64}
ARG RUST_ARCH=${RUST_ARCH/arm64/aarch64}
ARG TARGET=${RUST_ARCH}-unknown-linux-gnu
ARG RUSTFLAGS="-C target-feature=+crt-static"
ARG FRONTEND_DIR=/app/frontend
ARG FRONTEND_URL="http://localhost:3000/"
ARG BACKEND_URL="http://localhost:8000"

FROM node:26-slim@sha256:1e738cb88890a15c71880323fbc35a739b7bbc703d72e8bfd1613128f8182f78 AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json ./
COPY package-lock.json package.json ../

RUN npm ci

ARG FRONTEND_URL
ARG BACKEND_URL

COPY frontend/svelte.config.js frontend/tsconfig.json frontend/vite.config.ts ./
COPY frontend/src ./src
COPY frontend/static ./static

RUN npm run build

FROM ghcr.io/profiidev/images/rust-gnu-builder:main@sha256:15425af80485c6688cca13a291888674946c5fc3af0b8330c106ceff21c5af0b AS backend-planner

ARG TARGET
ARG RUSTFLAGS

COPY backend/Cargo.toml backend/
COPY backend/entity/Cargo.toml backend/entity/
COPY backend/migration/Cargo.toml backend/migration/
COPY ./Cargo.lock ./Cargo.toml ./

RUN \
  --mount=type=cache,target=/usr/local/cargo/registry \
  --mount=type=cache,target=/app/target \
  cargo chef prepare --recipe-path recipe.json --bin backend

FROM ghcr.io/profiidev/images/rust-gnu-builder:main@sha256:15425af80485c6688cca13a291888674946c5fc3af0b8330c106ceff21c5af0b AS backend-builder

ARG TARGET
ARG RUSTFLAGS
ARG FRONTEND_DIR
ARG FRONTEND_URL

COPY --from=backend-planner /app/recipe.json .

RUN \
  --mount=type=cache,target=/usr/local/cargo/registry \
  --mount=type=cache,target=/app/target \
  cargo chef cook --release --target $TARGET

COPY backend/Cargo.toml backend/
COPY backend/src backend/src
COPY backend/entity/Cargo.toml backend/entity/
COPY backend/entity/src backend/entity/src
COPY backend/migration/Cargo.toml backend/migration/
COPY backend/migration/src backend/migration/src
COPY ./Cargo.lock ./Cargo.toml ./

RUN \
  --mount=type=cache,target=/usr/local/cargo/registry \
  --mount=type=cache,target=/app/target \
  cd backend && cargo build --release --target $TARGET \
  && mv ../target/$TARGET/release/backend ../app

FROM node:26-slim@sha256:1e738cb88890a15c71880323fbc35a739b7bbc703d72e8bfd1613128f8182f78

ENV DB_URL="sqlite:/data/{{project-name}}.db?mode=rwc"
ENV SITE_URL="http://localhost:8000"

RUN mkdir -p /data \
    && groupadd -r {{project-name}} \
    && useradd -r -g {{project-name}} {{project-name}} \
    && chown -R {{project-name}}:{{project-name}} /data

COPY --from=backend-builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

WORKDIR /app
COPY --from=frontend-builder /app/frontend/build /app/frontend
COPY --from=frontend-builder /app/frontend/package.json /app/frontend/package.json
COPY --from=frontend-builder /app/package-lock.json /app/package-lock.json
COPY --from=backend-builder /app/app /usr/local/bin/{{project-name}}

USER {{project-name}}

ENTRYPOINT ["{{project-name}}"]
