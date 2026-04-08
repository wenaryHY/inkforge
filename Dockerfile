FROM rust:1.82-slim AS builder
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
ARG LITESTREAM_VERSION=v0.5.8
RUN apt-get update && apt-get install -y ca-certificates libsqlite3-0 curl && \
    curl -fsSL "https://github.com/benbjohnson/litestream/releases/download/${LITESTREAM_VERSION}/litestream-${LITESTREAM_VERSION}-linux-amd64.deb" -o /tmp/litestream.deb && \
    apt-get install -y /tmp/litestream.deb && rm -f /tmp/litestream.deb && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/target/release/inkforge /app/inkforge
COPY --from=builder /app/migrations /app/migrations
COPY --from=builder /app/themes /app/themes
COPY --from=builder /app/config /app/config
COPY docker/entrypoint.sh /app/entrypoint.sh
RUN mkdir -p /app/uploads /app/backups
RUN chmod +x /app/entrypoint.sh

ENV RUST_LOG=info
ENV INKFORGE__SERVER__PORT=3000
ENV INKFORGE__DATABASE__URL=sqlite://inkforge.db?mode=rwc
ENV INKFORGE__STORAGE__UPLOAD_DIR=/app/uploads
ENV LITESTREAM_ENABLED=1

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:3000/api/health || exit 1
VOLUME ["/app/uploads", "/app/backups"]
ENTRYPOINT ["/app/entrypoint.sh"]
