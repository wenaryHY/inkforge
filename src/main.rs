#[tokio::main]
async fn main() -> anyhow::Result<()> {
    inkforge::serve().await
}
