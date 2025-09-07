# 🔐 Authentication Troubleshooting Guide

## 🚨 **Current Issue: 401 Unauthorized Errors**

You're getting 401 errors on API endpoints, which means the authentication is not working properly. Let's diagnose and fix this step by step.

## 🔍 **Diagnostic Steps**

### **Step 1: Check Authentication Status**

1. **Go to the test page**: `http://localhost:3000/test-profile`
2. **Click "Check Auth Status (Debug)"** - This will show detailed authentication information
3. **Look for these key indicators**:
   - `hasUser: true/false`
   - `hasSession: true/false`
   - `userId: actual-uuid-or-null`
   - `cookieCount: number`
   - `supabaseCookies: array`

### **Step 2: Verify User Login Status**

Check if you're actually logged in:

1. **Open browser developer tools** (F12)
2. **Go to Application/Storage tab**
3. **Check Cookies** for your domain
4. **Look for Supabase cookies** (names starting with `sb-` or containing `supabase`)

### **Step 3: Check Console Logs**

1. **Open browser console** (F12 → Console)
2. **Look for authentication errors**
3. **Check server logs** in your terminal running the dev server

## 🛠️ **Common Fixes**

### **Fix 1: User Not Logged In**

If the debug shows `hasUser: false`:

1. **Sign out completely**:
   ```javascript
   // In browser console
   localStorage.clear()
   sessionStorage.clear()
   // Then refresh page
   ```

2. **Sign up/Login again**:
   - Go to the landing page
   - Click "Sign In" 
   - Complete the authentication flow

### **Fix 2: Session Expired**

If you see session-related errors:

1. **Refresh the session**:
   - Sign out and sign back in
   - Or refresh the page to trigger session refresh

### **Fix 3: Database Not Set Up**

If the debug shows authentication working but profile creation fails:

1. **Run the database schema**:
   ```sql
   -- In Supabase SQL Editor, run:
   -- database/schema/clean_schema.sql
   ```

2. **Verify tables exist**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' ORDER BY table_name;
   ```

### **Fix 4: Environment Variables**

Check your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Fix 5: Supabase RLS Policies**

If authentication works but database operations fail:

1. **Check RLS policies in Supabase**:
   ```sql
   -- Verify RLS is enabled
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   ORDER BY tablename;
   ```

2. **Check if bypass function exists**:
   ```sql
   SELECT proname FROM pg_proc 
   WHERE proname = 'create_user_profile_bypass_rls';
   ```

## 🧪 **Testing Authentication Flow**

### **Complete Test Sequence**

1. **Clear all data**:
   ```javascript
   // In browser console
   localStorage.clear()
   sessionStorage.clear()
   ```

2. **Refresh page** and go to landing page

3. **Sign up with new email**:
   - Use a test email like `test+123@yourdomain.com`
   - Complete email verification if required

4. **Check authentication**:
   - Go to `/test-profile`
   - Click "Check Auth Status (Debug)"
   - Verify `hasUser: true` and `hasSession: true`

5. **Test profile creation**:
   - Click "Fix/Create User Profile"
   - Should succeed with profile data

6. **Test Gmail connections**:
   - Click "Check Gmail Connections"
   - Should return empty array (no 401 error)

## 🔧 **Advanced Debugging**

### **Check Server Logs**

Look for these log messages in your terminal:

```
Create profile endpoint called
Auth check result: { hasUser: true, userId: "...", ... }
Gmail connections endpoint called
Gmail connections auth check: { hasUser: true, ... }
```

### **Check Network Requests**

In browser dev tools → Network tab:

1. **Look at API requests** to `/api/auth/create-profile` and `/api/gmail/connections`
2. **Check request headers** - should include cookies
3. **Check response** - should not be 401 if authenticated

### **Manual Database Test**

If authentication works but database operations fail:

```sql
-- Test user profile creation directly
SELECT create_user_profile_bypass_rls(
    '00000000-0000-0000-0000-000000000000'::uuid,
    'test@example.com',
    'Test User'
);

-- Check if users table exists and is accessible
SELECT COUNT(*) FROM users;
```

## 🚨 **Emergency Reset**

If nothing works, try this complete reset:

### **1. Clear All Local Data**
```javascript
// In browser console
localStorage.clear()
sessionStorage.clear()
document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
```

### **2. Reset Database**
```sql
-- In Supabase SQL Editor
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Then run the complete schema again
-- database/schema/clean_schema.sql
```

### **3. Restart Development Server**
```bash
# Stop the server (Ctrl+C)
# Clear Next.js cache
rm -rf .next
# Restart
npm run dev
```

### **4. Test Fresh Authentication**
- Go to landing page
- Sign up with completely new email
- Complete verification
- Test API endpoints

## 📞 **Getting Help**

If you're still getting 401 errors after trying these fixes:

1. **Share the debug output** from "Check Auth Status (Debug)"
2. **Share console logs** from both browser and server
3. **Confirm environment variables** are set correctly
4. **Verify database schema** was applied successfully

## ✅ **Success Indicators**

You'll know authentication is working when:

- ✅ **Debug shows**: `hasUser: true`, `hasSession: true`
- ✅ **Profile creation**: Returns success with user data
- ✅ **Gmail connections**: Returns empty array (not 401)
- ✅ **Console logs**: Show successful auth checks
- ✅ **No 401 errors** in network requests

---

## 🎯 **Most Likely Causes**

Based on the 401 errors you're seeing, the most likely causes are:

1. **User not logged in** - Sign in first
2. **Session expired** - Sign out and back in
3. **Database not set up** - Run the schema script
4. **Environment variables missing** - Check `.env.local`

Start with the diagnostic steps above to identify the exact issue!
