# 📧 Gmail Integration Testing Checklist

## Prerequisites
- [ ] Authentication tests completed successfully
- [ ] Google OAuth credentials configured (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- [ ] Gmail API enabled in Google Cloud Console
- [ ] User is logged into the application

---

## 1. Gmail Connection Setup

### Initial Connection State
- [ ] Navigate to `/dashboard`
- [ ] Gmail connection card shows "Not Connected" state
- [ ] "Connect Gmail" button is visible and enabled
- [ ] Connection status indicator shows disconnected state

### Gmail Connection Information
- [ ] Information about Gmail permissions is clearly displayed
- [ ] Privacy notice explains read-only access
- [ ] Benefits of connecting Gmail are explained
- [ ] Security information is provided

---

## 2. Gmail OAuth Flow

### Starting OAuth Flow
- [ ] Click "Connect Gmail" button
- [ ] Redirects to Google OAuth consent screen
- [ ] Consent screen shows correct application name
- [ ] Requested permissions are clearly listed
- [ ] Only Gmail read-only permission is requested

### OAuth Consent Screen
- [ ] Can select correct Google account
- [ ] Permission descriptions are accurate
- [ ] "Allow" button works correctly
- [ ] "Cancel" button works correctly
- [ ] Account selection works for multiple Google accounts

### OAuth Success Flow
- [ ] After granting permission, redirects back to application
- [ ] Success message appears
- [ ] Gmail connection status updates to "Connected"
- [ ] Connection timestamp is recorded
- [ ] User can see connected Gmail account email

---

## 3. Gmail Connection Management

### Connection Status Display
- [ ] Connected status shows green indicator
- [ ] Connected Gmail account email is displayed
- [ ] Connection date/time is shown
- [ ] "Disconnect" button is available

### Connection Persistence
- [ ] Gmail connection persists after browser refresh
- [ ] Connection status remains after logout/login
- [ ] Connection works across different browser sessions

---

## 4. Gmail Disconnection

### Disconnection Process
- [ ] Click "Disconnect" button
- [ ] Confirmation dialog appears (if implemented)
- [ ] Disconnection completes successfully
- [ ] Status updates to "Not Connected"
- [ ] Success message appears

### Post-Disconnection State
- [ ] Gmail tokens are removed from database
- [ ] Cannot perform Gmail operations after disconnection
- [ ] Can reconnect Gmail after disconnection
- [ ] No residual Gmail data remains

---

## 5. Gmail API Integration

### API Authorization
- [ ] Gmail API calls use correct OAuth tokens
- [ ] Token refresh works automatically
- [ ] Expired tokens are handled gracefully
- [ ] API rate limits are respected

### Error Handling
- [ ] Invalid tokens are handled properly
- [ ] Network errors show appropriate messages
- [ ] Gmail API errors are caught and displayed
- [ ] Retry logic works for transient failures

---

## 6. Settings Page Integration

### Gmail Settings Section
- [ ] Navigate to `/settings`
- [ ] Gmail integration section is visible
- [ ] Current connection status is displayed
- [ ] Connection management controls work

### Settings Persistence
- [ ] Gmail settings persist across sessions
- [ ] Settings changes are saved correctly
- [ ] Settings page reflects current Gmail state

---

## 7. Security & Privacy

### Token Security
- [ ] OAuth tokens are encrypted in storage
- [ ] Tokens are not visible in browser dev tools
- [ ] Tokens are transmitted securely
- [ ] Token refresh happens automatically

### Privacy Compliance
- [ ] Only read-only Gmail access is requested
- [ ] No email content is stored unnecessarily
- [ ] User can revoke access at any time
- [ ] Clear privacy policy is provided

### Permission Scope
- [ ] Only Gmail read permission is requested
- [ ] No write permissions are requested
- [ ] No access to other Google services
- [ ] Minimal required permissions only

---

## 8. Error Scenarios

### OAuth Errors
- [ ] User cancels OAuth flow → appropriate message
- [ ] Invalid OAuth configuration → error handling
- [ ] Network failure during OAuth → retry options
- [ ] Expired OAuth tokens → automatic refresh

### Gmail API Errors
- [ ] Gmail service unavailable → graceful degradation
- [ ] Rate limit exceeded → appropriate delays
- [ ] Invalid API responses → error messages
- [ ] Permission revoked → re-authentication prompt

### Connection Issues
- [ ] Internet connectivity loss → offline handling
- [ ] Server errors → retry mechanisms
- [ ] Timeout errors → user feedback
- [ ] Invalid credentials → re-authentication

---

## 9. User Experience

### Loading States
- [ ] Connection process shows loading indicators
- [ ] OAuth flow has appropriate loading states
- [ ] Disconnection shows progress feedback
- [ ] API calls show loading states

### User Feedback
- [ ] Success messages are clear and helpful
- [ ] Error messages are informative
- [ ] Progress indicators work correctly
- [ ] User knows what's happening at each step

### Accessibility
- [ ] Connection status is accessible to screen readers
- [ ] Buttons have proper ARIA labels
- [ ] Color indicators have text alternatives
- [ ] Keyboard navigation works

---

## 10. Integration with Other Features

### Dashboard Integration
- [ ] Gmail connection status shows in dashboard
- [ ] Sync features are enabled/disabled based on connection
- [ ] Quick actions reflect Gmail connection state

### Sync Integration
- [ ] Manual sync is only available when Gmail is connected
- [ ] Automatic sync requires Gmail connection
- [ ] Sync status reflects Gmail connection state

---

## 11. Mobile & Responsive Testing

### Mobile OAuth Flow
- [ ] Gmail OAuth works on mobile browsers
- [ ] Mobile consent screen is properly formatted
- [ ] Touch interactions work correctly
- [ ] Mobile redirects work properly

### Responsive Design
- [ ] Connection status displays well on mobile
- [ ] Buttons are touch-friendly
- [ ] Text is readable on small screens
- [ ] Mobile navigation works

---

## 12. Cross-Browser Testing

### Browser Compatibility
- [ ] Chrome: OAuth flow works completely
- [ ] Firefox: OAuth flow works completely
- [ ] Safari: OAuth flow works completely
- [ ] Edge: OAuth flow works completely

### Browser-Specific Features
- [ ] Popup blockers don't interfere
- [ ] Third-party cookies work correctly
- [ ] Local storage works across browsers
- [ ] Session handling is consistent

---

## 13. Advanced Scenarios

### Multiple Accounts
- [ ] Can select different Google accounts during OAuth
- [ ] Account switching works correctly
- [ ] Previous connections are properly replaced
- [ ] No conflicts between different accounts

### Re-connection
- [ ] Can reconnect after disconnection
- [ ] Re-connection uses fresh OAuth flow
- [ ] Previous data is handled correctly
- [ ] No duplicate connections created

### Token Management
- [ ] Token refresh works automatically
- [ ] Expired tokens trigger re-authentication
- [ ] Token revocation is handled gracefully
- [ ] Token storage is secure

---

## ✅ Gmail Integration Testing Summary

**Total Tests**: 80+ individual test cases

**Critical Path Tests** (Must Pass):
- [ ] Gmail OAuth connection works end-to-end
- [ ] Connection status is accurately displayed
- [ ] Disconnection works properly
- [ ] Token security is maintained
- [ ] Error handling works correctly
- [ ] Mobile OAuth flow works
- [ ] Integration with other features works

**Security Tests** (Must Pass):
- [ ] Only read-only permissions requested
- [ ] Tokens are securely stored
- [ ] No sensitive data exposed
- [ ] User can revoke access

**Issues Found**: _(Document any issues here)_

**Notes**: _(Add any additional observations)_
