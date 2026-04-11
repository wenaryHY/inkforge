# Login Page Testing Checklist

## Task 3: Checkpoint - Test Login Page Functionality

This document provides a comprehensive testing checklist for the login page after implementing language switching and visual redesign (Task 2).

---

## 1. Language Switching Tests

### 1.1 Language Switcher UI
- [ ] Language switcher is visible in the top-right corner of the login card
- [ ] Switcher displays "中" and "En" buttons
- [ ] Buttons have proper styling (rounded, no borders)
- [ ] Active language button is highlighted with orange background (#FF6D00)
- [ ] Inactive button has transparent background

### 1.2 Language Initialization
- [ ] Page loads with correct default language (browser language or cookie)
- [ ] If cookie exists, language loads from cookie
- [ ] If no cookie, language defaults to browser language (zh for Chinese, en for others)
- [ ] Active button reflects the current language on page load

### 1.3 Language Switching Behavior
- [ ] Clicking "中" button switches to Chinese
- [ ] Clicking "En" button switches to English
- [ ] All text elements update immediately when language changes
- [ ] No page reload required for language switch
- [ ] Active button state updates correctly

### 1.4 Translation Coverage
- [ ] Page title updates: "欢迎回来" ↔ "Welcome back"
- [ ] Subtitle updates: "登录后即可评论、管理个人中心与同步会话。" ↔ "Sign in to comment, manage your profile, and sync sessions."
- [ ] Login label updates: "登录名" ↔ "Username"
- [ ] Login placeholder updates: "用户名或邮箱" ↔ "Username or email"
- [ ] Password label updates: "密码" ↔ "Password"
- [ ] Password placeholder updates: "请输入密码" ↔ "Enter your password"
- [ ] Submit button updates: "登录" ↔ "Sign in"
- [ ] "Create account" link updates: "创建账号" ↔ "Create account"
- [ ] "Back to home" link updates: "返回首页" ↔ "Back to home"

### 1.5 Cookie Persistence
- [ ] Language preference is saved to cookie after switching
- [ ] Cookie persists after page reload
- [ ] Cookie expires in 365 days
- [ ] Cookie path is set to "/"

---

## 2. Authentication Flow Tests

### 2.1 Form Validation
- [ ] Username/email field is required
- [ ] Password field is required
- [ ] Form cannot be submitted with empty fields
- [ ] Browser validation messages appear for empty required fields

### 2.2 Login Success Flow
- [ ] Valid credentials trigger API call to `/api/v1/auth/login`
- [ ] Submit button is disabled during API call
- [ ] Successful login redirects to profile page (or redirect_to parameter)
- [ ] Session is established after successful login
- [ ] No error messages appear on success

### 2.3 Login Error Handling
- [ ] Invalid credentials show error alert
- [ ] Error alert displays appropriate message
- [ ] Error alert is styled correctly (red background, rounded corners)
- [ ] Submit button is re-enabled after error
- [ ] Form fields remain populated after error
- [ ] Error message is localized based on current language

### 2.4 API Integration
- [ ] Login API endpoint is `/api/v1/auth/login`
- [ ] Request includes `login` and `password` fields
- [ ] Request uses POST method
- [ ] Response is handled correctly (success and error cases)
- [ ] Client request ID is generated and sent

---

## 3. Visual Design Tests (The Radiant Minimalist)

### 3.1 Design System Compliance
- [ ] No 1px borders anywhere on the page
- [ ] Card uses 28px border-radius
- [ ] Glassmorphic effect applied: `backdrop-filter: blur(18px)`
- [ ] Card background is semi-transparent: `rgba(255,255,255,.75)`
- [ ] Card has appropriate shadow: `0 28px 80px rgba(61,47,41,.12)`

### 3.2 Color Palette
- [ ] Primary orange color: #FF6D00
- [ ] Background gradient: radial-gradient from #ffe5d6 to #f8fafc to #eef2ff
- [ ] Text colors: #3d2f29 (primary), #6b5d56 (secondary)
- [ ] Button uses solid orange background (no gradient)
- [ ] Button shadow: `0 8px 24px rgba(255,109,0,.24)`

### 3.3 Typography
- [ ] Manrope font family is loaded and applied
- [ ] Plus Jakarta Sans is available as secondary font
- [ ] Font weights are correct (500, 600, 700, 800)
- [ ] Title font size: 30px
- [ ] Body text font size: 15px
- [ ] Label font size: 13px

### 3.4 Input Styling
- [ ] Inputs have 16px border-radius
- [ ] Inputs have no borders, use subtle box-shadow instead
- [ ] Focus state shows orange accent: `0 0 0 2px #FF6D00`
- [ ] Focus state has outer glow: `0 0 0 4px rgba(255,109,0,.12)`
- [ ] Input padding: 14px vertical, 16px horizontal
- [ ] Inputs use white background

### 3.5 Button Styling
- [ ] Submit button has solid orange background (no gradient)
- [ ] Button has full rounded corners: `border-radius: 9999px`
- [ ] Button has shadow: `0 8px 24px rgba(255,109,0,.24)`
- [ ] Hover effect: translateY(-1px) and enhanced shadow
- [ ] Disabled state: opacity 0.5, no hover effects
- [ ] Button font weight: 800

### 3.6 Language Switcher Styling
- [ ] Switcher positioned absolutely in top-right
- [ ] Switcher background: `rgba(255,248,246,.6)`
- [ ] Switcher has 20px border-radius
- [ ] Buttons have 16px border-radius
- [ ] Active button has orange background
- [ ] Inactive button has transparent background
- [ ] Hover effect on inactive buttons

---

## 4. Responsive Behavior Tests

### 4.1 Mobile (< 520px)
- [ ] Card padding reduces to 30px 22px
- [ ] Card border-radius reduces to 22px
- [ ] Language switcher position adjusts: top 18px, right 18px
- [ ] Footer links stack vertically
- [ ] All text remains readable
- [ ] Touch targets are appropriately sized (min 44px)
- [ ] Form inputs are full width
- [ ] No horizontal scrolling

### 4.2 Tablet (520px - 768px)
- [ ] Card maintains standard padding: 40px 34px
- [ ] Card border-radius: 28px
- [ ] Language switcher position: top 22px, right 22px
- [ ] Footer links display horizontally
- [ ] Layout is centered and balanced

### 4.3 Desktop (> 768px)
- [ ] Card max-width: 420px
- [ ] Card is centered on screen
- [ ] All spacing is optimal
- [ ] Hover effects work correctly
- [ ] Focus states are visible

### 4.4 Cross-Device Testing
- [ ] Test on actual mobile device (iOS/Android)
- [ ] Test on tablet device
- [ ] Test on desktop browser
- [ ] Test in different orientations (portrait/landscape)
- [ ] Test with different screen resolutions

---

## 5. Browser Compatibility Tests

### 5.1 Modern Browsers
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Opera (latest)

### 5.2 Browser Features
- [ ] Backdrop-filter works (or graceful degradation)
- [ ] CSS custom properties work
- [ ] Flexbox layout works
- [ ] Border-radius works
- [ ] Box-shadow works
- [ ] Transitions work smoothly

---

## 6. Accessibility Tests

### 6.1 Keyboard Navigation
- [ ] Tab key navigates through all interactive elements
- [ ] Tab order is logical (language buttons → inputs → submit → links)
- [ ] Enter key submits form
- [ ] Focus indicators are visible
- [ ] No keyboard traps

### 6.2 Screen Reader Support
- [ ] Form labels are properly associated with inputs
- [ ] Button text is descriptive
- [ ] Error messages are announced
- [ ] Language switcher buttons have clear labels
- [ ] Page title is descriptive

### 6.3 Visual Accessibility
- [ ] Text contrast meets WCAG AA standards
- [ ] Focus indicators are visible
- [ ] Error states are not color-only
- [ ] Text is resizable without breaking layout
- [ ] No text in images

---

## 7. Performance Tests

### 7.1 Load Performance
- [ ] Page loads in under 2 seconds
- [ ] Fonts load without FOUT/FOIT
- [ ] No layout shift during load
- [ ] Images (if any) are optimized

### 7.2 Runtime Performance
- [ ] Language switching is instant (< 100ms)
- [ ] Form submission is responsive
- [ ] Animations are smooth (60fps)
- [ ] No memory leaks

---

## 8. Integration Tests

### 8.1 Navigation
- [ ] "Create account" link navigates to `/register`
- [ ] "Back to home" link navigates to `/`
- [ ] Successful login redirects correctly
- [ ] Redirect parameter is respected

### 8.2 Session Management
- [ ] Login establishes session
- [ ] Session persists across page reloads
- [ ] Session cookie is set correctly
- [ ] Logout clears session

---

## Test Execution Summary

### Automated Tests
- [ ] Run browser-based test suite: `login-test.html`
- [ ] All automated tests pass

### Manual Tests
- [ ] Complete visual inspection
- [ ] Test all user interactions
- [ ] Test on multiple devices
- [ ] Test in multiple browsers

### Issues Found
Document any issues found during testing:

1. 
2. 
3. 

### Sign-off
- [ ] All critical tests pass
- [ ] All blocking issues resolved
- [ ] Ready to proceed to Task 4

---

## Notes

- This checkpoint ensures Task 2 implementation is complete and correct
- Any issues found should be fixed before proceeding to Task 4
- Document any deviations from requirements
- Take screenshots of visual issues for reference
