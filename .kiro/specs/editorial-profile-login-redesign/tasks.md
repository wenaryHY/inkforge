# Implementation Plan: Editorial Profile & Login Redesign

## Overview

This implementation plan covers the complete redesign of the Profile and Login pages using "The Radiant Minimalist" design system. The work involves updating HTML templates, implementing CSS design system rules, enhancing JavaScript interactions, and adding comprehensive language switching capabilities. The implementation follows a progressive approach: establish the design system foundation, update the Login page with language switching, then reconstruct the Profile page with all new features.

## Tasks

- [x] 1. Implement Design System Foundation
  - Update CSS custom properties for The Radiant Minimalist design system
  - Define color palette with orange (#FF6D00) primary and warm neutrals
  - Set typography system using Manrope and Plus Jakarta Sans fonts
  - Establish spacing scale and border-radius values (28px-48px)
  - Create glassmorphic effect utilities with backdrop-filter
  - Remove all 1px borders, implement color layering patterns
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 2. Update Login Page with Language Switching
  - [x] 2.1 Add language switcher component to login.html
    - Create compact toggle button with "中" and "En" options
    - Position switcher in top-right corner of the card
    - Apply design system styling (no borders, rounded corners)
    - _Requirements: 2.5_
  
  - [x] 2.2 Extend i18n.js with login page translations
    - Add translation keys for login page: title, subtitle, labels, placeholders, buttons
    - Add Chinese (zh) translations for all login elements
    - Add English (en) translations for all login elements
    - Implement cookie-based language persistence
    - _Requirements: 2.1, 2.4_
  
  - [x] 2.3 Integrate i18n system into login page
    - Load i18n.js script in login.html
    - Add data-i18n attributes to all translatable elements
    - Initialize I18n system with browser language or cookie preference
    - Wire language switcher buttons to I18n.init() function
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ]* 2.4 Write property test for language switching
    - **Property 1: Language Change Updates All Translatable Elements**
    - **Validates: Requirements 2.3, 7.3**
    - Test that all elements with data-i18n attributes update when language changes
  
  - [x] 2.5 Apply visual redesign to login page
    - Replace gradient button with solid orange background
    - Increase card border-radius to 28px
    - Add glassmorphic effect with backdrop-filter: blur(18px)
    - Remove 1px borders, use rgba background layering
    - Update focus states to use orange accent with subtle shadow
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Checkpoint - Test login page functionality
  - Ensure language switching works correctly
  - Verify authentication flow remains functional
  - Test responsive behavior on mobile/tablet/desktop
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Reconstruct Profile Page Layout
  - [x] 4.1 Create glassmorphic navigation bar
    - Build nav with "Back home", language switcher, "Admin", "Sign out" buttons
    - Apply glassmorphic styling with backdrop-blur
    - Use solid color buttons (no gradients)
    - Implement responsive stacking for mobile
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [x] 4.2 Build user hero section with avatar
    - Create avatar component displaying first character of display_name
    - Apply large rounded corners (24px) to avatar
    - Display user metadata: username, role, join date
    - Use borderless card design with glassmorphic background
    - _Requirements: 4.2_
  
  - [x] 4.3 Write property test for user hero section
    - **Property 2: User Hero Section Renders Complete User Data**
    - **Validates: Requirement 4.2**
    - Test that avatar and all metadata fields render correctly for any valid user object
  
  - [x] 4.4 Implement card-based section containers
    - Create borderless card containers for profile settings, password, comments
    - Apply 28px-48px border-radius to all cards
    - Use background color variations for visual separation
    - Add glassmorphic effects with backdrop-filter
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 4.6_

- [x] 5. Implement Profile Statistics Display
  - [x] 5.1 Create statistics card component
    - Build stats display showing posts_count, comments_count, likes_count
    - Position stats card below hero section
    - Use borderless design with large rounded corners
    - Apply responsive grid layout
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [x] 5.2 Fetch and display user statistics
    - Add API call to fetch user statistics on page load
    - Render statistics with labels and values
    - Handle loading and error states
    - _Requirements: 5.4, 5.5_
  
  - [x] 5.3 Write property test for statistics display
    - **Property 3: Statistics Display Renders All User Metrics**
    - **Validates: Requirements 5.1, 5.2, 5.3**
    - Test that all three metrics render correctly for any user statistics object

- [x] 6. Build Profile Settings Form
  - [x] 6.1 Create profile form with design system styling
    - Build form with display_name, language, theme_preference, bio fields
    - Apply 16px border-radius to all inputs
    - Implement orange accent focus states with subtle shadow
    - Use consistent padding (14px vertical, 16px horizontal)
    - _Requirements: 9.1, 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [x] 6.2 Implement profile form submission
    - Wire form submit to PATCH /api/me/profile endpoint
    - Validate display_name is not empty before submission
    - Display success alert on successful update
    - Display error alert with failure reason on error
    - _Requirements: 9.2, 9.3, 9.4, 9.5_
  
  - [ ]* 6.3 Write property test for display name validation
    - **Property 6: Display Name Validation Rejects Empty Input**
    - **Validates: Requirement 9.5**
    - Test that validation correctly rejects empty/whitespace strings
  
  - [ ]* 6.4 Write unit tests for profile form
    - Test form submission with valid data
    - Test error handling for API failures
    - Test alert display for success and error states

- [x] 7. Implement Security Settings Section
  - [x] 7.1 Create password change form
    - Build form with current_password, new_password, confirm_password fields
    - Apply design system styling to all inputs
    - Use borderless card design with large rounded corners
    - _Requirements: 6.1, 6.5_
  
  - [x] 7.2 Implement password validation and submission
    - Validate new_password matches confirm_password before submission
    - Display error if passwords don't match
    - Wire form submit to PATCH /api/v1/me/password endpoint
    - Display success alert and clear form on success
    - Display error alert on failure
    - _Requirements: 6.2, 6.3, 6.4_
  
  - [ ]* 7.3 Write property test for password validation
    - **Property 4: Password Validation Correctly Matches Inputs**
    - **Validates: Requirement 6.2**
    - Test that validation returns true only for identical password pairs
  
  - [ ]* 7.4 Write unit tests for password change
    - Test password mismatch error handling
    - Test successful password change flow
    - Test API error handling

- [x] 8. Checkpoint - Test profile forms and security
  - Verify profile form updates work correctly
  - Test password change validation and submission
  - Ensure error and success alerts display properly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement Profile Page Language Switching
  - [x] 9.1 Add language switcher to profile navigation
    - Create compact toggle with "中" and "En" options
    - Apply design system styling (no borders, rounded corners)
    - Position in navigation bar
    - _Requirements: 7.2_
  
  - [x] 9.2 Extend i18n.js with profile page translations
    - Add translation keys for all profile page elements
    - Include navigation, section titles, form labels, buttons, alerts
    - Add Chinese (zh) and English (en) translations
    - _Requirements: 7.1, 7.3_
  
  - [x] 9.3 Integrate language switching with backend persistence
    - Wire language switcher to I18n.init() function
    - Send PATCH request to /api/v1/me/profile with language preference
    - Reload page after successful language update
    - Handle API errors gracefully
    - _Requirements: 7.4, 7.5_
  
  - [x] 9.4 Write property test for language switching
    - **Property 1: Language Change Updates All Translatable Elements**
    - **Validates: Requirements 2.3, 7.3**
    - Test that all profile page elements update when language changes

- [x] 10. Build Comments List Display
  - [x] 10.1 Create comments list component
    - Build comment item cards with borderless design
    - Apply 20px border-radius to comment cards
    - Display post_title, status, created_at, content for each comment
    - Use background color variations for visual separation
    - _Requirements: 10.2, 10.5_
  
  - [x] 10.2 Fetch and render user comments
    - Add API call to GET /api/me/comments on page load
    - Render comments list with all required fields
    - Display empty state message when no comments exist
    - Display error message when API request fails
    - _Requirements: 10.1, 10.3, 10.4_
  
  - [x] 10.3 Write property test for comments list rendering
    - **Property 7: Comments List Renders All Required Fields**
    - **Validates: Requirement 10.2**
    - Test that all comment fields render correctly for any comment array
  
  - [x] 10.4 Write unit tests for comments list
    - Test empty state display
    - Test error state display
    - Test comment rendering with various data

- [x] 11. Implement Responsive Layout System
  - [x] 11.1 Add mobile breakpoint styles (< 768px)
    - Stack form fields vertically
    - Adjust card padding to 22px
    - Stack navigation buttons vertically
    - Reduce border-radius to 22px for smaller screens
    - _Requirements: 8.1, 8.2_
  
  - [x] 11.2 Add tablet breakpoint styles (768px - 1024px)
    - Use two-column grid for form fields
    - Maintain card-based layout
    - Adjust spacing and padding for medium screens
    - _Requirements: 8.3_
  
  - [x] 11.3 Add desktop breakpoint styles (> 1024px)
    - Use full multi-column layout
    - Apply maximum width constraints (920px)
    - Optimize spacing for large screens
    - _Requirements: 8.4_
  
  - [x] 11.4 Write responsive layout tests
    - Test layout behavior at mobile breakpoint
    - Test layout behavior at tablet breakpoint
    - Test layout behavior at desktop breakpoint
    - Verify readability and usability across all breakpoints
    - _Requirements: 8.5_

- [x] 12. Final Integration and Polish
  - [x] 12.1 Wire all navigation actions
    - Implement "Back home" navigation
    - Implement "Admin" navigation
    - Implement "Sign out" with logout API call and redirect
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  
  - [x] 12.2 Add error alert component styling
    - Create reusable error alert component
    - Apply design system styling (borderless, rounded)
    - Ensure error messages display correctly
    - _Requirements: 9.4_
  
  - [x] 12.3 Write property test for error alerts
    - **Property 5: Error Alerts Display Error Messages**
    - **Validates: Requirement 9.4**
    - Test that error alerts display message text for any error response
  
  - [x] 12.4 Verify all design system rules are applied
    - Confirm no 1px borders exist
    - Verify all border-radius values are 28px-48px for cards, 16px for inputs
    - Check glassmorphic effects are applied correctly
    - Ensure solid color buttons (no gradients)
    - Validate color palette usage
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 13. Final checkpoint - Complete testing
  - Test complete user flows on both pages
  - Verify responsive behavior across all devices
  - Test language switching on both pages
  - Verify all API integrations work correctly
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation maintains backward compatibility with existing API endpoints
- All visual changes follow The Radiant Minimalist design system rules
