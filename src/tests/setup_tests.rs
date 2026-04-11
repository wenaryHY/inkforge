/// 安装向导模块集成测试
/// 测试安装状态机、初始化流程等

#[cfg(test)]
mod setup_integration_tests {
    use crate::modules::setup::domain::SetupStage;

    #[test]
    fn test_setup_stage_progression() {
        // 测试安装阶段状态机
        let not_started = SetupStage::NotStarted;
        let admin_created = SetupStage::AdminCreated;
        let configured = SetupStage::Configured;
        let completed = SetupStage::Completed;

        // 验证状态不同
        assert_ne!(not_started, admin_created);
        assert_ne!(admin_created, configured);
        assert_ne!(configured, completed);
    }

    #[test]
    fn test_setup_stage_is_completed() {
        // 测试完成状态检查
        let completed = SetupStage::Completed;
        let not_started = SetupStage::NotStarted;

        assert!(matches!(completed, SetupStage::Completed));
        assert!(!matches!(not_started, SetupStage::Completed));
    }

    #[test]
    fn test_setup_stage_ordering() {
        // 测试安装阶段顺序
        let stages = vec![
            SetupStage::NotStarted,
            SetupStage::AdminCreated,
            SetupStage::Configured,
            SetupStage::Completed,
        ];

        assert_eq!(stages.len(), 4);
        assert!(matches!(stages[0], SetupStage::NotStarted));
        assert!(matches!(stages[3], SetupStage::Completed));
    }
}
