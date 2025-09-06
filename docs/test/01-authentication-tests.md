# 🔐 Authentication Testing Checklist

## Prerequisites
- [X] Environment variables are set up (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, etc.)
- [X] Supabase project is created and database schema is applied
- [X] Application is running at http://localhost:3000

---

## 1. Landing Page & Navigation

### Landing Page Access
- [X] Navigate to http://localhost:3000
- [X] Landing page loads without errors
- [X] "Get Started" button is visible and clickable
- [X] "Sign In" button is visible and clickable
- [X] Navigation links work correctly

### Authentication Links
- [X] Click "Get Started" → redirects to `/auth/signup`
- [X] Click "Sign In" → redirects to `/auth/login`
- [X] Navigation between login and signup pages works
- [X] "Already have an account?" link works on signup page
- [X] "Don't have an account?" link works on login page

---

## 2. User Registration (Email/Password)

### Signup Form Validation
- [X] Navigate to `/auth/signup`
- [X] Form displays correctly with all fields (Full Name, Email, Password)
- [X] Try submitting empty form → validation errors appear
- [X] Try invalid email format → email validation error appears
- [X] Try weak password → password validation works
- [X] Form shows loading state when submitting

### Successful Registration
- [X] Fill in valid details (Full Name, Email, Password)
- [X] Click "Sign Up" button
- [X] Success message appears or redirect to dashboard occurs
- [X] Check email for confirmation link (if email confirmation is enabled)
- [X] User can access dashboard after successful signup

### Registration Error Handling
- [X] Try registering with existing email → appropriate error message
- [X] Test with invalid email domain → proper error handling
- [X] Test network failure scenario → error message displays

---

## 3. User Login (Email/Password)

### Login Form Validation
- [X] Navigate to `/auth/login`
- [X] Form displays correctly with Email and Password fields
- [X] Try submitting empty form → validation errors appear
- [X] Try invalid email format → email validation error appears
- [X] Password field has show/hide toggle functionality

### Successful Login
- [X] Enter valid credentials
- [X] Click "Sign In" button
- [X] Successful redirect to dashboard (`/dashboard`)
- [X] User information displays correctly in dashboard
- [X] Session persists after browser refresh

### Login Error Handling
- [X] Try invalid email → appropriate error message
- [X] Try wrong password → appropriate error message
- [X] Try non-existent user → appropriate error message
- [X] Test network failure → error message displays

---

## 4. Google OAuth Integration

### Google OAuth Flow
- [X] Click "Continue with Google" button on login page
- [X] Redirects to Google OAuth consent screen
- [X] Google login form appears correctly
- [X] Can select Google account
- [X] Permission consent screen shows correct app name and permissions

### OAuth Success Flow
- [ ] Complete Google OAuth flow
- [ ] Redirects back to application
- [ ] Automatically logs in user
- [ ] Redirects to dashboard
- [ ] User profile shows Google account information
- [ ] Session persists after browser refresh

### OAuth Error Handling
- [ ] Cancel OAuth flow → returns to login with appropriate message
- [ ] Test with restricted Google account → proper error handling
- [ ] Test OAuth callback errors → graceful error handling

---

## 5. Session Management

### Session Persistence
- [ ] Log in successfully
- [ ] Close browser tab and reopen
- [ ] User remains logged in
- [ ] Refresh page → user stays logged in
- [ ] Navigate directly to `/dashboard` → access granted

### Session Expiration
- [ ] Log in successfully
- [ ] Wait for session to expire (or manually expire in dev tools)
- [ ] Try accessing protected route → redirects to login
- [ ] Login again → works correctly

---

## 6. Protected Routes

### Dashboard Access
- [ ] Without login, navigate to `/dashboard` → redirects to login
- [ ] After login, can access `/dashboard`
- [ ] Dashboard displays user information correctly

### Transactions Access
- [ ] Without login, navigate to `/transactions` → redirects to login
- [ ] After login, can access `/transactions`
- [ ] Transactions page loads correctly

### Settings Access
- [ ] Without login, navigate to `/settings` → redirects to login
- [ ] After login, can access `/settings`
- [ ] Settings page loads correctly

---

## 7. Logout Functionality

### Logout Process
- [ ] Click logout button in dashboard header
- [ ] User is logged out successfully
- [ ] Redirects to landing page
- [ ] Session is cleared (check browser dev tools)
- [ ] Cannot access protected routes after logout

### Post-Logout Behavior
- [ ] Try accessing `/dashboard` after logout → redirects to login
- [ ] Login again after logout → works correctly
- [ ] No residual user data visible after logout

---

## 8. User Profile Management

### Profile Display
- [ ] User's full name displays correctly in dashboard
- [ ] User's email displays correctly
- [ ] Avatar/profile picture shows (if implemented)
- [ ] Account type information is visible

### Profile Updates (if implemented)
- [ ] Can update full name
- [ ] Can update profile picture
- [ ] Changes persist after refresh
- [ ] Validation works for profile updates

---

## 9. Error Handling & Edge Cases

### Network Issues
- [ ] Test with slow internet → loading states work
- [ ] Test with no internet → appropriate error messages
- [ ] Test server downtime → graceful degradation

### Browser Compatibility
- [ ] Test in Chrome → all features work
- [ ] Test in Firefox → all features work
- [ ] Test in Safari → all features work
- [ ] Test in mobile browsers → responsive and functional

### Security Tests
- [ ] Cannot access protected routes without authentication
- [ ] Session tokens are secure (check dev tools)
- [ ] No sensitive data exposed in client-side code
- [ ] CSRF protection works correctly

---

## 10. Mobile & Responsive Testing

### Mobile Authentication
- [ ] Login form works on mobile devices
- [ ] Signup form works on mobile devices
- [ ] Google OAuth works on mobile
- [ ] Touch interactions work correctly

### Responsive Design
- [ ] Forms are properly sized on small screens
- [ ] Buttons are touch-friendly
- [ ] Text is readable on mobile
- [ ] Navigation works on mobile

---

## ✅ Authentication Testing Summary

**Total Tests**: 60+ individual test cases

**Critical Path Tests** (Must Pass):
- [ ] User can register with email/password
- [ ] User can login with email/password
- [ ] Google OAuth login works end-to-end
- [ ] Protected routes are properly secured
- [ ] Session management works correctly
- [ ] Logout functionality works
- [ ] Mobile authentication works

**Issues Found**: _(Document any issues here)_

**Notes**: _(Add any additional observations)_
