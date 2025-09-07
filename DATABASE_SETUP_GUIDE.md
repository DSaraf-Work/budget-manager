# 🗄️ Complete Database Setup Guide

## 📋 **Overview**

This guide walks you through setting up the complete Budget Manager database from scratch using the comprehensive schema file. The database supports multi-Gmail account integration, transaction tracking, and user management with proper security and performance optimizations.

## 🎯 **What Gets Created**

### **📊 Core Tables**
- **`users`** - User profiles (clean, no Gmail columns)
- **`gmail_connections`** - Multi-account Gmail OAuth connections
- **`transactions`** - Financial transactions from Gmail or manual entry
- **`gmail_messages`** - Processed Gmail messages for transaction extraction
- **`whitelisted_senders`** - Trusted email senders for auto-processing
- **`sync_logs`** - Sync operation logs for monitoring and debugging

### **🔧 Database Features**
- **Custom Types**: Enums for transaction types, categories, and sync status
- **Indexes**: Optimized for common query patterns
- **RLS Policies**: Secure data isolation per user
- **Functions**: Utility functions for user stats and cleanup
- **Triggers**: Automatic timestamp updates
- **Views**: Pre-built queries for common data aggregations

## 🚀 **Setup Instructions**

### **Step 1: Prepare Supabase**

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to SQL Editor

2. **Clear Existing Data** (if needed)
   ```sql
   -- Only run if you want to start completely fresh
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
   ```

### **Step 2: Execute Database Schema**

1. **Copy the Complete Schema**
   - Open `database/schema/clean_schema.sql`
   - Copy the entire file content

2. **Run in Supabase SQL Editor**
   - Paste the complete schema into Supabase SQL Editor
   - Click "Run" to execute the entire script
   - Wait for completion (should take 10-30 seconds)

3. **Verify Success**
   ```sql
   -- Check that all tables were created
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

   **Expected tables:**
   - `gmail_connections`
   - `gmail_messages`
   - `sync_logs`
   - `transactions`
   - `users`
   - `whitelisted_senders`

### **Step 3: Verify Database Setup**

Run these verification queries in Supabase SQL Editor:

```sql
-- 1. Verify all tables exist
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 3. Verify indexes were created
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- 4. Test user profile creation function
SELECT create_user_profile_bypass_rls(
    '00000000-0000-0000-0000-000000000000'::uuid,
    'test@example.com',
    'Test User'
);
```

## 🔒 **Security Features**

### **Row Level Security (RLS)**
- ✅ **Enabled on all tables**
- ✅ **User-scoped access**: Users can only see their own data
- ✅ **Automatic filtering**: All queries filtered by `auth.uid()`

### **Data Isolation**
- ✅ **Users**: Can only access their own profile
- ✅ **Gmail Connections**: Scoped to user
- ✅ **Transactions**: User-specific
- ✅ **Messages**: Tied to user's Gmail connections
- ✅ **Sync Logs**: User-specific operation logs

## 📈 **Performance Optimizations**

### **Indexes Created**
- **Users**: Email, active status
- **Gmail Connections**: User ID, email, status, active connections
- **Transactions**: User ID, date, type, category, merchant, amount
- **Gmail Messages**: User ID, connection ID, Gmail message ID, sender, date
- **Whitelisted Senders**: User ID, email, active status
- **Sync Logs**: User ID, connection ID, type/status, date

### **Query Optimization**
- **Composite indexes** for common query patterns
- **Partial indexes** for filtered queries (e.g., active records only)
- **Unique constraints** to prevent data duplication

## 🛠️ **Utility Functions**

### **User Profile Creation**
```sql
-- Server-side user profile creation (bypasses RLS)
SELECT create_user_profile_bypass_rls(
    user_id::uuid,
    'user@example.com',
    'User Name'
);
```

### **User Statistics**
```sql
-- Get comprehensive user stats
SELECT * FROM get_user_stats('user-uuid-here');
```

### **Cleanup Old Data**
```sql
-- Clean up sync logs older than 30 days
SELECT cleanup_old_sync_logs();
```

## 📊 **Useful Views**

### **Transaction Summary by Category**
```sql
-- View transaction patterns by category
SELECT * FROM transaction_summary_by_category 
WHERE user_id = auth.uid();
```

### **Gmail Connection Status**
```sql
-- Monitor Gmail connection health
SELECT * FROM gmail_connection_status 
WHERE user_id = auth.uid();
```

## 🧪 **Testing the Setup**

### **1. Test User Profile Creation**
```sql
-- Create a test user profile
SELECT create_user_profile_bypass_rls(
    gen_random_uuid(),
    'test@example.com',
    'Test User'
);
```

### **2. Test Gmail Connection**
```sql
-- Insert a test Gmail connection
INSERT INTO gmail_connections (
    user_id, gmail_email, access_token, refresh_token
) VALUES (
    auth.uid(),
    'test@gmail.com',
    'test_access_token',
    'test_refresh_token'
);
```

### **3. Test Transaction Creation**
```sql
-- Insert a test transaction
INSERT INTO transactions (
    user_id, amount, type, category, description, transaction_date
) VALUES (
    auth.uid(),
    -25.50,
    'expense',
    'food_dining',
    'Coffee shop purchase',
    NOW()
);
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **"relation does not exist" errors**
- **Cause**: Schema not fully executed
- **Solution**: Re-run the complete schema file

#### **"permission denied" errors**
- **Cause**: RLS policies blocking access
- **Solution**: Ensure you're authenticated and using correct user ID

#### **"function does not exist" errors**
- **Cause**: Functions not created properly
- **Solution**: Check for SQL errors in function creation

### **Verification Commands**
```sql
-- Check if extensions are enabled
SELECT * FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto');

-- Check if custom types exist
SELECT typname FROM pg_type WHERE typname IN ('transaction_type', 'transaction_category', 'sync_status');

-- Check if functions exist
SELECT proname FROM pg_proc WHERE proname LIKE '%user%' OR proname LIKE '%sync%';
```

## 🔮 **Next Steps**

### **Application Integration**
1. **Update Environment Variables**: Ensure Supabase credentials are set
2. **Test API Endpoints**: Verify database connections work
3. **User Registration**: Test user profile creation flow
4. **Gmail Integration**: Test OAuth and connection creation

### **Production Considerations**
1. **Token Encryption**: Implement encryption for OAuth tokens
2. **Backup Strategy**: Set up automated database backups
3. **Monitoring**: Monitor query performance and errors
4. **Cleanup Jobs**: Schedule regular cleanup of old sync logs

### **Optional Enhancements**
1. **Sample Data**: Uncomment sample whitelisted senders in schema
2. **Additional Indexes**: Add indexes based on actual usage patterns
3. **Custom Functions**: Add business-specific utility functions
4. **Views**: Create additional views for reporting

---

## ✅ **Database Setup Complete!**

Your Budget Manager database is now ready with:
- **🏗️ Complete Schema**: All tables, indexes, and relationships
- **🔒 Security**: RLS policies and data isolation
- **📈 Performance**: Optimized indexes and queries
- **🛠️ Utilities**: Helper functions and views
- **🧪 Testing**: Verification queries and test data

**🚀 Ready to start building your Gmail-integrated budget manager!**
