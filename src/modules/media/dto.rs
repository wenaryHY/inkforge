use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct MediaQuery {
    pub page: Option<i64>,
    pub page_size: Option<i64>,
    pub kind: Option<String>,
}
