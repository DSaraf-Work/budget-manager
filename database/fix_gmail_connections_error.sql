-- ============================================================================
-- FIX GMAIL CONNECTIONS ERROR - EMERGENCY SCHEMA REPAIR
-- ============================================================================
-- 
-- This script fixes the "permission denied for table gmail_connections" error
-- by ensuring the table exists and RLS policies are properly configured.
--
-- Run this entire script in Supabase SQL Editor to fix the issue.
-- ============================================================================

-- ============================================================================
-- STEP 1: CHECK CURRENT STATE
-- ============================================================================

-- Check if gmail_connections table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'gmail_connections') THEN
        RAISE NOTICE 'gmail_connections table EXISTS';
    ELSE
        RAISE NOTICE 'gmail_connections table DOES NOT EXIST - will create';
    END IF;
END $$;

-- ============================================================================
-- STEP 2: CREATE MISSING TYPES (IF NEEDED)
-- ============================================================================

-- Create sync_status type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sync_status') THEN
        CREATE TYPE sync_status AS ENUM ('pending', 'syncing', 'completed', 'error');
        RAISE NOTICE 'Created sync_status type';
    ELSE
        RAISE NOTICE 'sync_status type already exists';
    END IF;
END $$;

-- ============================================================================
-- STEP 3: CREATE GMAIL_CONNECTIONS TABLE (IF MISSING)
-- ============================================================================

-- Create gmail_connections table if it doesn't exist
CREATE TABLE IF NOT EXISTS gmail_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    gmail_email TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    sync_status sync_status DEFAULT 'pending',
    error_count INTEGER DEFAULT 0 CHECK (error_count >= 0),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 4: CREATE INDEXES (IF MISSING)
-- ============================================================================

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_gmail_connections_user_id ON gmail_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_gmail_connections_gmail_email ON gmail_connections(gmail_email);
CREATE INDEX IF NOT EXISTS idx_gmail_connections_active ON gmail_connections(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_gmail_connections_sync_status ON gmail_connections(sync_status);

-- Create unique constraint to prevent duplicate active connections
CREATE UNIQUE INDEX IF NOT EXISTS idx_gmail_connections_unique_user_email 
ON gmail_connections(user_id, gmail_email) WHERE is_active = true;

-- ============================================================================
-- STEP 5: ENABLE RLS AND CREATE POLICIES
-- ============================================================================

-- Enable RLS on gmail_connections table
ALTER TABLE gmail_connections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own gmail connections" ON gmail_connections;
DROP POLICY IF EXISTS "Users can insert own gmail connections" ON gmail_connections;
DROP POLICY IF EXISTS "Users can update own gmail connections" ON gmail_connections;
DROP POLICY IF EXISTS "Users can delete own gmail connections" ON gmail_connections;

-- Create RLS policies for gmail_connections
CREATE POLICY "Users can view own gmail connections" ON gmail_connections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gmail connections" ON gmail_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gmail connections" ON gmail_connections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gmail connections" ON gmail_connections
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 6: CREATE USERS TABLE (IF MISSING)
-- ============================================================================

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    sync_frequency_hours INTEGER DEFAULT 24 CHECK (sync_frequency_hours > 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create RLS policies for users
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- STEP 7: CREATE UTILITY FUNCTIONS
-- ============================================================================

-- Create user profile bypass function
CREATE OR REPLACE FUNCTION create_user_profile_bypass_rls(
    user_id UUID,
    user_email TEXT,
    user_full_name TEXT DEFAULT NULL
)
RETURNS users
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges
AS $$
DECLARE
    new_user users;
BEGIN
    -- Insert the user profile bypassing RLS
    INSERT INTO users (id, email, full_name, created_at, updated_at)
    VALUES (user_id, user_email, user_full_name, NOW(), NOW())
    RETURNING * INTO new_user;
    
    RETURN new_user;
EXCEPTION
    WHEN unique_violation THEN
        -- If user already exists, return the existing user
        SELECT * INTO new_user FROM users WHERE id = user_id;
        RETURN new_user;
    WHEN OTHERS THEN
        -- Re-raise any other errors
        RAISE;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_user_profile_bypass_rls TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile_bypass_rls TO service_role;

-- ============================================================================
-- STEP 8: VERIFICATION
-- ============================================================================

-- Verify tables exist
SELECT 'VERIFICATION: Tables created' as status, 
       array_agg(table_name ORDER BY table_name) as tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'gmail_connections');

-- Verify RLS is enabled
SELECT 'VERIFICATION: RLS enabled' as status,
       array_agg(tablename ORDER BY tablename) as tables_with_rls
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'gmail_connections')
AND rowsecurity = true;

-- Verify policies exist
SELECT 'VERIFICATION: Policies created' as status,
       count(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('users', 'gmail_connections');

-- ============================================================================
-- STEP 9: TEST GMAIL CONNECTIONS ACCESS
-- ============================================================================

-- Test if gmail_connections table is accessible
DO $$
BEGIN
    -- Try to select from gmail_connections (should work even if empty)
    PERFORM COUNT(*) FROM gmail_connections;
    RAISE NOTICE 'SUCCESS: gmail_connections table is accessible';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: gmail_connections table access failed: %', SQLERRM;
END $$;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

SELECT 'GMAIL CONNECTIONS ERROR FIX COMPLETED!' as message,
       'You can now test the Gmail connections API endpoint' as next_step;
