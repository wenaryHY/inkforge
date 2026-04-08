// 前台国际化支持
(function() {
  'use strict';

  // 翻译字典
  const dictionary = {
    zh: {
      // 导航
      backHome: '返回首页',
      signOut: '退出登录',
      admin: '管理后台',

      // 用户
      role: '角色',
      joined: '加入于',

      // 设置
      profileSettings: '个人设置',
      displayName: '显示名称',
      language: '语言',
      themePreference: '主题偏好',
      system: '跟随系统',
      light: '浅色模式',
      dark: '深色模式',
      bio: '个人简介',
      bioPlaceholder: '写一段简短的介绍',
      saveProfile: '保存设置',

      // 密码
      changePassword: '修改密码',
      currentPassword: '当前密码',
      newPassword: '新密码',
      confirmPassword: '确认新密码',
      updatePassword: '更新密码',

      // 评论
      myComments: '我的评论',
      noComments: '暂无评论',
      loadCommentsError: '无法加载评论',

      // 提示
      profileUpdated: '个人资料已更新',
      passwordUpdated: '密码已更新',
      passwordMismatch: '两次输入的密码不一致',
    },
    en: {
      // Nav
      backHome: 'Back home',
      signOut: 'Sign out',
      admin: 'Admin',

      // User
      role: 'role',
      joined: 'joined',

      // Settings
      profileSettings: 'Profile settings',
      displayName: 'Display name',
      language: 'Language',
      themePreference: 'Theme preference',
      system: 'System',
      light: 'Light',
      dark: 'Dark',
      bio: 'Bio',
      bioPlaceholder: 'Write a short bio',
      saveProfile: 'Save profile',

      // Password
      changePassword: 'Change password',
      currentPassword: 'Current password',
      newPassword: 'New password',
      confirmPassword: 'Confirm new password',
      updatePassword: 'Update password',

      // Comments
      myComments: 'My comments',
      noComments: 'No comments yet',
      loadCommentsError: 'Unable to load comments',

      // Messages
      profileUpdated: 'Profile updated',
      passwordUpdated: 'Password updated',
      passwordMismatch: 'Password confirmation does not match',
    },
  };

  let currentLang = 'zh';

  // 翻译函数
  function t(key, fallback) {
    const dict = dictionary[currentLang] || dictionary.zh;
    return dict[key] || fallback || key;
  }

  // 更新页面文本
  function updatePage() {
    // 更新所有带有 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = t(key, el.textContent);
      }
    });

    // 更新 placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.placeholder = t(key, el.placeholder);
      }
    });

    // 更新语言按钮状态
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const btnLang = btn.dataset.lang;
      if (btnLang === currentLang) {
        btn.style.background = 'var(--accent)';
        btn.style.color = '#fff';
      } else {
        btn.style.background = 'transparent';
        btn.style.color = 'var(--text)';
      }
    });
  }

  // 初始化
  function init(lang) {
    currentLang = lang || 'zh';
    updatePage();
  }

  // 暴露到全局
  window.I18n = {
    t,
    init,
    updatePage,
    getLang: () => currentLang,
  };
})();
