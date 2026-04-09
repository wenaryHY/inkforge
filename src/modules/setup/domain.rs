use serde::Serialize;
use std::str::FromStr;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum SetupStage {
    NotStarted,
    AdminCreated,
    Configured,
    Completed,
}

impl SetupStage {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::NotStarted => "not_started",
            Self::AdminCreated => "admin_created",
            Self::Configured => "configured",
            Self::Completed => "completed",
        }
    }

    pub fn is_completed(self) -> bool {
        matches!(self, Self::Completed)
    }

    pub fn infer_legacy(setup_completed: bool, user_count: i64) -> Self {
        if setup_completed || user_count > 0 {
            return Self::Completed;
        }
        Self::NotStarted
    }
}

impl Default for SetupStage {
    fn default() -> Self {
        Self::NotStarted
    }
}

impl FromStr for SetupStage {
    type Err = ();

    fn from_str(value: &str) -> Result<Self, Self::Err> {
        match value.trim() {
            "not_started" => Ok(Self::NotStarted),
            "admin_created" => Ok(Self::AdminCreated),
            "configured" => Ok(Self::Configured),
            "completed" => Ok(Self::Completed),
            _ => Err(()),
        }
    }
}
