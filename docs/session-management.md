# 🔐 Session Management Implementation

## Overview

The Budget Manager application now implements persistent user session management with extended duration and automatic token refresh. Users remain logged in across browser restarts, tab closures, and page refreshes for up to 30 days unless they explicitly log out.

## Key Features

### ✅ Session Persistence
- **Browser Restart**: Sessions persist after closing and reopening the browser
- **Tab Closure**: Sessions persist when closing and reopening tabs
- **Page Refresh**: Sessions persist through page refreshes and navigation
- **Cross-Tab**: Session state is shared across multiple tabs

### ✅ Extended Duration
- **30-Day Sessions**: Configurable session duration (default: 30 days)
- **No Unexpected Logouts**: Users stay logged in during normal usage
- **Manual Logout Only**: Sessions only end when user explicitly signs out

### ✅ Automatic Token Refresh
- **Background Refresh**: Tokens refresh automatically before expiration
- **Seamless Experience**: No interruption to user workflow
- **Error Handling**: Graceful handling of refresh failures

### ✅ Secure Storage
- **localStorage**: Persistent storage across browser sessions
- **Encrypted Tokens**: Secure token storage with Supabase
- **Custom Storage Key**: Isolated storage to prevent conflicts

## Implementation Details

### Core Components

#### 1. Enhanced Supabase Client (`src/lib/supabase/client.ts`)
```typescript
export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storageKey: 'budget-manager-auth-token',
      }
    }
  )
```

#### 2. Session Manager (`src/lib/auth/session-manager.ts`)
- **Singleton Pattern**: Single instance manages all session operations
- **Automatic Monitoring**: Checks session status every 5 minutes
- **Token Refresh**: Refreshes tokens 10 minutes before expiration
- **Event Handling**: Responds to auth state changes

#### 3. Auth Provider (`src/components/providers/AuthProvider.tsx`)
- **React Context**: Provides session state throughout the app
- **Real-time Updates**: Updates UI when session changes
- **Session Information**: Exposes session expiry and refresh functions

#### 4. Protected Routes (`src/components/auth/ProtectedRoute.tsx`)
- **Route Protection**: Ensures only authenticated users access protected pages
- **Automatic Redirects**: Redirects unauthenticated users to login
- **Public Route Handling**: Redirects authenticated users away from auth pages

### Session Flow

#### 1. Initial Load
```
App Start → Check localStorage → Session Found → Validate Token → Dashboard
                                → No Session → Landing Page
```

#### 2. Authentication
```
Login/Signup → Supabase Auth → Token Storage → Session Manager → Dashboard
```

#### 3. Session Monitoring
```
Every 5 minutes → Check Token Expiry → Refresh if Needed → Continue Session
                                     → Refresh Failed → Logout
```

#### 4. Logout
```
User Logout → Clear Tokens → Clear Storage → Redirect to Landing
```

## Configuration

### Environment Variables
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Session Configuration (optional)
SESSION_DURATION_DAYS=30
TOKEN_REFRESH_THRESHOLD_MINUTES=10
SESSION_CHECK_INTERVAL_MINUTES=5
```

### Customizable Settings
- **Session Duration**: Modify `SESSION_DURATION_DAYS` (default: 30 days)
- **Refresh Threshold**: When to refresh tokens before expiry
- **Check Interval**: How often to monitor session status
- **Storage Key**: Custom key for localStorage

## Security Considerations

### ✅ Implemented Security Features
- **PKCE Flow**: Secure OAuth flow with code challenge
- **Token Encryption**: Supabase handles token encryption
- **Secure Storage**: localStorage with custom key
- **Automatic Cleanup**: Tokens cleared on logout
- **Session Validation**: Regular token validation

### 🔒 Security Best Practices
- **HTTPS Only**: Ensure production uses HTTPS
- **Token Rotation**: Automatic token refresh
- **Logout Cleanup**: Complete session data removal
- **Protected Routes**: Server-side route protection

## Testing

### Automated Tests (`tests/e2e/session-persistence.spec.ts`)
- ✅ Session persists after tab closure
- ✅ Session persists after page refresh
- ✅ Session persists between route navigation
- ✅ Protected routes redirect without session
- ✅ Auth pages redirect with active session
- ✅ Proper session cleanup on logout
- ✅ Session information display
- ✅ Manual session refresh
- ✅ Session storage verification

### Running Tests
```bash
# Install Playwright
npm run playwright:install

# Run session-specific tests
npm run test:session

# Run full session test suite with manual verification
npm run test:session-full

# Run all e2e tests
npm run test:e2e
```

### Manual Testing Checklist
- [ ] Sign up and verify dashboard access
- [ ] Close browser, reopen, verify still logged in
- [ ] Refresh page multiple times
- [ ] Navigate between protected routes
- [ ] Test logout and verify session cleared
- [ ] Test protected route access without session

## Usage Examples

### Using the Auth Hook
```typescript
import { useAuth } from '@/components/providers/AuthProvider'

function MyComponent() {
  const { user, isAuthenticated, signOut, sessionExpiry } = useAuth()
  
  if (!isAuthenticated) {
    return <div>Please log in</div>
  }
  
  return (
    <div>
      <p>Welcome, {user.email}</p>
      <p>Session expires in: {sessionExpiry.timeUntilExpiry}ms</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### Protecting Routes
```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
```

### Session Information Display
```typescript
function SessionInfo() {
  const { sessionExpiry, refreshSession } = useAuth()
  
  return (
    <div>
      <p>Expires in: {formatTime(sessionExpiry.timeUntilExpiry)}</p>
      <button onClick={refreshSession}>Refresh Session</button>
    </div>
  )
}
```

## Troubleshooting

### Common Issues

#### Session Not Persisting
- Check localStorage for `budget-manager-auth-token`
- Verify Supabase configuration
- Check browser console for errors

#### Unexpected Logouts
- Check token refresh settings
- Verify network connectivity
- Check Supabase project status

#### OAuth Issues
- Verify Google OAuth configuration
- Check redirect URIs
- Ensure proper environment variables

### Debug Information
```typescript
// Check session status
const { session, sessionExpiry } = useAuth()
console.log('Session:', session)
console.log('Expires at:', new Date(sessionExpiry.expiresAt * 1000))

// Manual session refresh
const success = await refreshSession()
console.log('Refresh success:', success)
```

## Migration Guide

### From Previous Implementation
1. Update Supabase client configuration
2. Replace auth context with new AuthProvider
3. Wrap protected routes with ProtectedRoute component
4. Update logout handlers to use new signOut method
5. Test session persistence functionality

### Breaking Changes
- Auth context API has changed
- Session storage key has changed
- Protected route implementation is different

## Future Enhancements

### Planned Features
- [ ] Session analytics and monitoring
- [ ] Configurable session duration per user
- [ ] Multi-device session management
- [ ] Session activity logging
- [ ] Advanced security features (device fingerprinting)

### Performance Optimizations
- [ ] Lazy session validation
- [ ] Background token refresh optimization
- [ ] Session state caching
- [ ] Reduced localStorage access

## Support

For issues or questions about session management:
1. Check the troubleshooting section
2. Review test results
3. Check browser console for errors
4. Verify Supabase configuration
5. Test with fresh browser session
