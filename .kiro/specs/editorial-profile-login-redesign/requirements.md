# Requirements Document

## Introduction

本文档定义了 Profile 和 Login 页面重构的功能需求，应用 "The Radiant Minimalist" 高端编辑风格设计系统。重构的核心目标是通过无边框布局、大圆角、玻璃态效果和暖色调橙色配色创建现代化、高端的用户体验。设计强调通过背景色变化而非传统边框来建立视觉层次。

This document defines the functional requirements for the Profile and Login page redesign, applying "The Radiant Minimalist" high-end editorial design system. The core objective is to create a modern, premium user experience through borderless layouts, large rounded corners, glassmorphism effects, and warm orange color tones. The design emphasizes visual hierarchy through background color variations rather than traditional borders.

## Glossary

- **Design_System**: The Radiant Minimalist design system that enforces visual rules through CSS custom properties
- **Login_Page**: The authentication page where users enter credentials
- **Profile_Page**: The user profile management page displaying user information, settings, and comments
- **Language_Switcher**: UI component allowing users to toggle between Chinese (zh) and English (en)
- **Glassmorphic_Effect**: Visual effect using backdrop-filter blur and semi-transparent backgrounds
- **Stats_Display**: Component showing user statistics (posts, comments, likes)
- **Security_Section**: Area containing password change and security settings
- **Responsive_Layout**: Layout that adapts to mobile, tablet, and desktop viewports
- **I18n_System**: Internationalization system managing translations and language switching

## Requirements

### Requirement 1: Design System Implementation

**User Story:** As a developer, I want to implement the Radiant Minimalist design system, so that both pages follow consistent visual rules and styling patterns.

#### Acceptance Criteria

1. THE Design_System SHALL enforce no 1px borders, using background color variations instead
2. THE Design_System SHALL use border-radius values between 28px and 48px for all card components
3. THE Design_System SHALL apply glassmorphic effects using backdrop-filter blur
4. THE Design_System SHALL use solid color buttons without gradients for primary actions
5. THE Design_System SHALL use Manrope and Plus Jakarta Sans font families
6. THE Design_System SHALL implement the orange (#FF6D00) primary color with warm neutral tones

### Requirement 2: Login Page Language Switching

**User Story:** As a user, I want to switch between Chinese and English on the login page, so that I can use the interface in my preferred language.

#### Acceptance Criteria

1. WHEN the Login_Page loads, THE I18n_System SHALL initialize with the browser's default language or saved cookie preference
2. WHEN a user clicks the Language_Switcher, THE I18n_System SHALL toggle between Chinese (zh) and English (en)
3. WHEN the language changes, THE Login_Page SHALL update all text elements including title, labels, placeholders, and buttons
4. WHEN the language changes, THE I18n_System SHALL persist the language preference to a cookie
5. THE Language_Switcher SHALL display as a compact toggle button with "中" and "En" options

### Requirement 3: Login Page Visual Redesign

**User Story:** As a user, I want a visually refined login page, so that I have a premium authentication experience.

#### Acceptance Criteria

1. THE Login_Page SHALL use solid color buttons without gradient effects
2. THE Login_Page SHALL apply large rounded corners (28px minimum) to the card container
3. THE Login_Page SHALL use glassmorphic effects with backdrop-filter blur on the card
4. THE Login_Page SHALL remove all 1px borders, using background color layering instead
5. WHEN form inputs receive focus, THE Login_Page SHALL display subtle visual feedback using the orange accent color
6. THE Login_Page SHALL maintain the existing authentication flow and API integration

### Requirement 4: Profile Page Complete Reconstruction

**User Story:** As a user, I want a completely redesigned profile page, so that I can manage my account with a modern, organized interface.

#### Acceptance Criteria

1. THE Profile_Page SHALL implement a card-based layout using borderless design
2. THE Profile_Page SHALL display user information in a hero section with avatar and metadata
3. THE Profile_Page SHALL organize content into distinct sections: profile settings, password change, and comments
4. THE Profile_Page SHALL use large rounded corners (28px-48px) for all card components
5. THE Profile_Page SHALL apply glassmorphic effects to navigation and card elements
6. THE Profile_Page SHALL remove all 1px borders, using background color variations for visual separation

### Requirement 5: Profile Page Statistics Display

**User Story:** As a user, I want to see my activity statistics, so that I can track my engagement on the platform.

#### Acceptance Criteria

1. THE Stats_Display SHALL show the total number of posts created by the user
2. THE Stats_Display SHALL show the total number of comments made by the user
3. THE Stats_Display SHALL show the total number of likes received by the user
4. WHEN the Profile_Page loads, THE Stats_Display SHALL fetch statistics from the API
5. THE Stats_Display SHALL use card-based design with borderless styling

### Requirement 6: Profile Page Security Settings

**User Story:** As a user, I want enhanced security settings, so that I can manage my account security effectively.

#### Acceptance Criteria

1. THE Security_Section SHALL provide a password change form with current password, new password, and confirmation fields
2. WHEN a user submits the password change form, THE Security_Section SHALL validate that new password and confirmation match
3. WHEN password validation fails, THE Security_Section SHALL display an error message
4. WHEN password change succeeds, THE Security_Section SHALL display a success message and clear the form
5. THE Security_Section SHALL use borderless card design with large rounded corners

### Requirement 7: Profile Page Language Switching

**User Story:** As a user, I want to switch languages on my profile page, so that I can use the interface in my preferred language.

#### Acceptance Criteria

1. WHEN the Profile_Page loads, THE I18n_System SHALL initialize with the user's saved language preference
2. WHEN a user clicks the Language_Switcher, THE I18n_System SHALL toggle between Chinese (zh) and English (en)
3. WHEN the language changes, THE Profile_Page SHALL update all text elements including navigation, labels, buttons, and section titles
4. WHEN the language changes, THE Profile_Page SHALL send a PATCH request to update the user's language preference in the database
5. WHEN the language preference is updated, THE Profile_Page SHALL reload to apply the new language

### Requirement 8: Responsive Layout Implementation

**User Story:** As a user, I want the pages to work seamlessly on all devices, so that I can access my account from mobile, tablet, or desktop.

#### Acceptance Criteria

1. WHEN the viewport width is below 768px (mobile), THE Responsive_Layout SHALL stack form fields vertically
2. WHEN the viewport width is below 768px (mobile), THE Responsive_Layout SHALL adjust card padding and spacing
3. WHEN the viewport width is between 768px and 1024px (tablet), THE Responsive_Layout SHALL use a two-column grid for form fields
4. WHEN the viewport width is above 1024px (desktop), THE Responsive_Layout SHALL use the full multi-column layout
5. THE Responsive_Layout SHALL maintain readability and usability across all breakpoints

### Requirement 9: Profile Form Management

**User Story:** As a user, I want to update my profile information, so that I can keep my account details current.

#### Acceptance Criteria

1. THE Profile_Page SHALL provide form fields for display name, language, theme preference, and bio
2. WHEN a user submits the profile form, THE Profile_Page SHALL send a PATCH request to the API
3. WHEN the profile update succeeds, THE Profile_Page SHALL display a success alert
4. WHEN the profile update fails, THE Profile_Page SHALL display an error alert with the failure reason
5. THE Profile_Page SHALL validate that display name is not empty before submission

### Requirement 10: Comments List Display

**User Story:** As a user, I want to view my comment history, so that I can track my interactions on the platform.

#### Acceptance Criteria

1. WHEN the Profile_Page loads, THE Profile_Page SHALL fetch the user's comments from the API
2. WHEN comments are available, THE Profile_Page SHALL display them in a list with post title, status, timestamp, and content
3. WHEN no comments exist, THE Profile_Page SHALL display an empty state message
4. WHEN the comments API request fails, THE Profile_Page SHALL display an error message
5. THE Profile_Page SHALL render comment items using borderless card design with large rounded corners

### Requirement 11: Navigation and Actions

**User Story:** As a user, I want clear navigation and action buttons, so that I can easily move between pages and perform actions.

#### Acceptance Criteria

1. THE Profile_Page SHALL provide a navigation bar with "Back home", language switcher, "Admin", and "Sign out" buttons
2. WHEN a user clicks "Sign out", THE Profile_Page SHALL call the logout API and redirect to the login page
3. WHEN a user clicks "Back home", THE Profile_Page SHALL navigate to the homepage
4. WHEN a user clicks "Admin", THE Profile_Page SHALL navigate to the admin panel
5. THE Profile_Page SHALL use solid color buttons without gradients for all action buttons

### Requirement 12: Form Input Styling

**User Story:** As a developer, I want consistent form input styling, so that all interactive elements follow the design system.

#### Acceptance Criteria

1. THE Design_System SHALL apply 16px border-radius to all input fields, textareas, and select elements
2. WHEN an input receives focus, THE Design_System SHALL display an orange accent border and subtle shadow
3. THE Design_System SHALL use consistent padding (14px vertical, 16px horizontal) for all inputs
4. THE Design_System SHALL remove default browser outlines and apply custom focus states
5. THE Design_System SHALL ensure all form elements inherit the Manrope font family
