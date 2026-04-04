use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct PaginationQuery {
    pub page: Option<i64>,
    pub page_size: Option<i64>,
}

impl PaginationQuery {
    pub fn normalized(&self, default_size: i64, max_size: i64) -> (i64, i64, i64) {
        let page = self.page.unwrap_or(1).max(1);
        let page_size = self.page_size.unwrap_or(default_size).clamp(1, max_size);
        let offset = (page - 1) * page_size;
        (page, page_size, offset)
    }
}
