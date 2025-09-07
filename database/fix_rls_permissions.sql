-- ============================================================================
-- FIX RLS PERMISSIONS FOR GMAIL_CONNECTIONS TABLE
-- ============================================================================
-- 
-- This script fixes the "permission denied for table gmail_connections" error
-- by properly configuring RLS policies and ensuring the authenticated user
-- has the correct permissions.
--
-- Run this entire script in Supabase SQL Editor to fix the issue.
-- ============================================================================

-- ============================================================================
-- STEP 1: DIAGNOSE CURRENT STATE
-- ============================================================================

-- Check if table exists
SELECT 'gmail_connections table exists:' as check_name, 
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'gmail_connections') as result;

-- Check if RLS is enabled
SELECT 'RLS enabled on gmail_connections:' as check_name,
       rowsecurity as result
FROM pg_tables 
WHERE tablename = 'gmail_connections';

-- Check existing policies
SELECT 'Existing policies:' as check_name,
       string_agg(policyname, ', ') as result
FROM pg_policies 
WHERE tablename = 'gmail_connections';

-- Check current user context
SELECT 'Current auth.uid():' as check_name,
       auth.uid() as result;

-- ============================================================================
-- STEP 2: RECREATE TABLE WITH PROPER PERMISSIONS (IF NEEDED)
-- ============================================================================

-- Ensure the table exists with correct structure
CREATE TABLE IF NOT EXISTS gmail_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    gmail_email TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'completed', 'error')),
    error_count INTEGER DEFAULT 0 CHECK (error_count >= 0),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: DISABLE RLS TEMPORARILY TO RESET POLICIES
-- ============================================================================

-- Disable RLS temporarily
ALTER TABLE gmail_connections DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own gmail connections" ON gmail_connections;
DROP POLICY IF EXISTS "Users can insert own gmail connections" ON gmail_connections;
DROP POLICY IF EXISTS "Users can update own gmail connections" ON gmail_connections;
DROP POLICY IF EXISTS "Users can delete own gmail connections" ON gmail_connections;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON gmail_connections;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON gmail_connections;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON gmail_connections;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON gmail_connections;

-- ============================================================================
-- STEP 4: GRANT BASIC TABLE PERMISSIONS
-- ============================================================================

-- Grant basic permissions to authenticated role
GRANT ALL ON gmail_connections TO authenticated;
GRANT ALL ON gmail_connections TO service_role;

-- Grant usage on the sequence (for UUID generation)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================================================
-- STEP 5: RE-ENABLE RLS WITH PROPER POLICIES
-- ============================================================================

-- Re-enable RLS
ALTER TABLE gmail_connections ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies
CREATE POLICY "authenticated_users_select_own_gmail_connections" ON gmail_connections
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "authenticated_users_insert_own_gmail_connections" ON gmail_connections
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_users_update_own_gmail_connections" ON gmail_connections
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_users_delete_own_gmail_connections" ON gmail_connections
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = user_id);

-- Create service role policies (for server-side operations)
CREATE POLICY "service_role_all_access" ON gmail_connections
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- STEP 6: ENSURE USERS TABLE HAS PROPER PERMISSIONS TOO
-- ============================================================================

-- Grant permissions on users table
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO service_role;

-- Ensure users table has RLS enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop and recreate users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "authenticated_users_select_own_profile" ON users
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "authenticated_users_insert_own_profile" ON users
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "authenticated_users_update_own_profile" ON users
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "service_role_users_all_access" ON users
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- STEP 7: TEST ACCESS WITH CURRENT USER
-- ============================================================================

-- Test if current user can access gmail_connections
DO $$
DECLARE
    current_user_id UUID;
    test_count INTEGER;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE NOTICE 'WARNING: No authenticated user found (auth.uid() is NULL)';
        RAISE NOTICE 'This script should be run while authenticated in Supabase';
    ELSE
        RAISE NOTICE 'Current authenticated user ID: %', current_user_id;
        
        -- Test SELECT access
        BEGIN
            SELECT COUNT(*) INTO test_count FROM gmail_connections WHERE user_id = current_user_id;
            RAISE NOTICE 'SUCCESS: Can SELECT from gmail_connections (found % rows)', test_count;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'ERROR: Cannot SELECT from gmail_connections: %', SQLERRM;
        END;
        
        -- Test if user profile exists
        BEGIN
            SELECT COUNT(*) INTO test_count FROM users WHERE id = current_user_id;
            IF test_count > 0 THEN
                RAISE NOTICE 'SUCCESS: User profile exists in users table';
            ELSE
                RAISE NOTICE 'WARNING: User profile does not exist in users table';
                RAISE NOTICE 'Run: SELECT create_user_profile_bypass_rls(''%'', ''email'', ''name'');', current_user_id;
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'ERROR: Cannot access users table: %', SQLERRM;
        END;
    END IF;
END $$;

-- ============================================================================
-- STEP 8: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_gmail_connections_user_id ON gmail_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_gmail_connections_gmail_email ON gmail_connections(gmail_email);
CREATE INDEX IF NOT EXISTS idx_gmail_connections_active ON gmail_connections(user_id, is_active) WHERE is_active = true;

-- ============================================================================
-- STEP 9: VERIFICATION QUERIES
-- ============================================================================

-- Final verification
SELECT 'VERIFICATION COMPLETE' as status;

SELECT 'Table permissions:' as check_name,
       string_agg(privilege_type, ', ') as permissions
FROM information_schema.table_privileges 
WHERE table_name = 'gmail_connections' 
AND grantee = 'authenticated';

SELECT 'RLS policies created:' as check_name,
       count(*) as policy_count
FROM pg_policies 
WHERE tablename = 'gmail_connections';

SELECT 'Ready to test Gmail connections API' as next_step;

-- ============================================================================
-- STEP 10: MANUAL TEST QUERY
-- ============================================================================

-- You can run this manually to test access:
-- SELECT * FROM gmail_connections WHERE user_id = auth.uid();
