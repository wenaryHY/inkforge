FROM rust:1.77-slim AS builder
WORKDIR /app
COPY Cargo.toml Cargo.lock* ./
COPY src ./src
COPY migrations ./migrations
COPY themes ./themes
COPY config ./config
RUN apt-get update && apt-get install -y pkg-config libsqlite3-dev && \
    cargo build --release && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates libsqlite3-0 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/target/release/halo-rs /app/halo-rs
COPY --from=builder /app/migrations /app/migrations
COPY --from=builder /app/themes /app/themes
COPY --from=builder /app/config /app/config
RUN mkdir -p /app/uploads /app/data

ENV RUST_LOG=info
ENV HALO__SERVER__PORT=3000
ENV HALO__DATABASE__URL=sqlite:///app/data.db
ENV HALO__UPLOAD__DIR=/app/uploads

EXPOSE 3000
VOLUME ["/app/data", "/app/uploads"]
ENTRYPOINT ["/app/halo-rs"]
