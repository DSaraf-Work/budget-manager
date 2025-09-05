-- ============================================================================
-- SAFE DATABASE SCHEMA SETUP - HANDLES EXISTING OBJECTS
-- ============================================================================
-- 
-- This script safely sets up the database schema, handling cases where
-- some objects might already exist. It uses IF NOT EXISTS and DROP IF EXISTS
-- to ensure the script can be run multiple times safely.
--
-- Execute this entire script in Supabase SQL Editor to set up the database.
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for encryption functions (if needed in future)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CLEAN UP EXISTING OBJECTS (IF NEEDED)
-- ============================================================================

-- Drop existing views first (they depend on tables)
DROP VIEW IF EXISTS transaction_summary_by_category;
DROP VIEW IF EXISTS gmail_connection_status;

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_gmail_connections_updated_at ON gmail_connections;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
DROP TRIGGER IF EXISTS update_gmail_messages_updated_at ON gmail_messages;
DROP TRIGGER IF EXISTS update_whitelisted_senders_updated_at ON whitelisted_senders;
DROP TRIGGER IF EXISTS update_sync_logs_completed_at ON sync_logs;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS update_sync_log_completed_at();
DROP FUNCTION IF EXISTS create_user_profile_bypass_rls(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS get_user_stats(UUID);
DROP FUNCTION IF EXISTS cleanup_old_sync_logs();

-- Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS sync_logs;
DROP TABLE IF EXISTS whitelisted_senders;
DROP TABLE IF EXISTS gmail_messages;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS gmail_connections;
DROP TABLE IF EXISTS users;

-- Drop existing types
DROP TYPE IF EXISTS sync_status;
DROP TYPE IF EXISTS transaction_category;
DROP TYPE IF EXISTS transaction_type;

-- ============================================================================
-- ENUMS AND CUSTOM TYPES
-- ============================================================================

-- Transaction types
CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');

-- Transaction categories
CREATE TYPE transaction_category AS ENUM (
    'food_dining',
    'transportation',
    'shopping',
    'entertainment',
    'bills_utilities',
    'healthcare',
    'education',
    'travel',
    'business',
    'investment',
    'other'
);

-- Sync status for various operations
CREATE TYPE sync_status AS ENUM ('pending', 'syncing', 'completed', 'error');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table (clean, no Gmail integration)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    sync_frequency_hours INTEGER DEFAULT 24 CHECK (sync_frequency_hours > 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gmail connections table (supports multiple accounts per user)
CREATE TABLE gmail_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gmail_connection_id UUID REFERENCES gmail_connections(id) ON DELETE SET NULL,
    gmail_message_id TEXT, -- Gmail message ID that generated this transaction
    amount DECIMAL(12,2) NOT NULL CHECK (amount != 0),
    currency TEXT DEFAULT 'USD' NOT NULL,
    type transaction_type NOT NULL,
    category transaction_category DEFAULT 'other',
    description TEXT NOT NULL,
    merchant_name TEXT,
    transaction_date TIMESTAMPTZ NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT false,
    notes TEXT,
    metadata JSONB, -- Additional data from email parsing
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gmail messages table (tracks processed emails)
CREATE TABLE gmail_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gmail_connection_id UUID NOT NULL REFERENCES gmail_connections(id) ON DELETE CASCADE,
    gmail_message_id TEXT NOT NULL, -- Gmail's unique message ID
    thread_id TEXT,
    subject TEXT,
    sender_email TEXT NOT NULL,
    sender_name TEXT,
    received_at TIMESTAMPTZ NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    is_transaction_email BOOLEAN DEFAULT false,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    raw_content TEXT, -- Store relevant email content for debugging
    processing_status sync_status DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Whitelisted senders table (trusted email senders for transactions)
CREATE TABLE whitelisted_senders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_address TEXT NOT NULL,
    sender_name TEXT,
    is_active BOOLEAN DEFAULT true,
    auto_process BOOLEAN DEFAULT true, -- Automatically process emails from this sender
    transaction_type transaction_type, -- Default transaction type for this sender
    default_category transaction_category, -- Default category for transactions
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync logs table (tracks sync operations and errors)
CREATE TABLE sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gmail_connection_id UUID REFERENCES gmail_connections(id) ON DELETE CASCADE,
    sync_type TEXT NOT NULL, -- 'gmail_sync', 'transaction_processing', etc.
    status sync_status NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    messages_processed INTEGER DEFAULT 0,
    transactions_created INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    error_details JSONB,
    metadata JSONB, -- Additional sync information
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;

-- Gmail connections indexes
CREATE INDEX idx_gmail_connections_user_id ON gmail_connections(user_id);
CREATE INDEX idx_gmail_connections_gmail_email ON gmail_connections(gmail_email);
CREATE INDEX idx_gmail_connections_active ON gmail_connections(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_gmail_connections_sync_status ON gmail_connections(sync_status);

-- Transactions indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_gmail_connection_id ON transactions(gmail_connection_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_merchant ON transactions(merchant_name);
CREATE INDEX idx_transactions_amount ON transactions(amount);

-- Gmail messages indexes
CREATE INDEX idx_gmail_messages_user_id ON gmail_messages(user_id);
CREATE INDEX idx_gmail_messages_connection_id ON gmail_messages(gmail_connection_id);
CREATE INDEX idx_gmail_messages_gmail_id ON gmail_messages(gmail_message_id);
CREATE INDEX idx_gmail_messages_sender ON gmail_messages(sender_email);
CREATE INDEX idx_gmail_messages_received_at ON gmail_messages(received_at DESC);
CREATE INDEX idx_gmail_messages_processing_status ON gmail_messages(processing_status);
CREATE INDEX idx_gmail_messages_is_transaction ON gmail_messages(is_transaction_email) WHERE is_transaction_email = true;

-- Whitelisted senders indexes
CREATE INDEX idx_whitelisted_senders_user_id ON whitelisted_senders(user_id);
CREATE INDEX idx_whitelisted_senders_email ON whitelisted_senders(email_address);
CREATE INDEX idx_whitelisted_senders_active ON whitelisted_senders(user_id, is_active) WHERE is_active = true;

-- Sync logs indexes
CREATE INDEX idx_sync_logs_user_id ON sync_logs(user_id);
CREATE INDEX idx_sync_logs_connection_id ON sync_logs(gmail_connection_id);
CREATE INDEX idx_sync_logs_type_status ON sync_logs(sync_type, status);
CREATE INDEX idx_sync_logs_started_at ON sync_logs(started_at DESC);

-- ============================================================================
-- UNIQUE CONSTRAINTS
-- ============================================================================

-- Prevent duplicate active Gmail connections per user
CREATE UNIQUE INDEX idx_gmail_connections_unique_user_email 
ON gmail_connections(user_id, gmail_email) WHERE is_active = true;

-- Prevent duplicate Gmail message processing
CREATE UNIQUE INDEX idx_gmail_messages_unique_connection_message
ON gmail_messages(gmail_connection_id, gmail_message_id);

-- Prevent duplicate whitelisted senders per user
CREATE UNIQUE INDEX idx_whitelisted_senders_unique_user_email
ON whitelisted_senders(user_id, email_address) WHERE is_active = true;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gmail_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gmail_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whitelisted_senders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Gmail connections policies
CREATE POLICY "Users can view own gmail connections" ON gmail_connections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gmail connections" ON gmail_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gmail connections" ON gmail_connections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gmail connections" ON gmail_connections
    FOR DELETE USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Gmail messages policies
CREATE POLICY "Users can view own gmail messages" ON gmail_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gmail messages" ON gmail_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gmail messages" ON gmail_messages
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gmail messages" ON gmail_messages
    FOR DELETE USING (auth.uid() = user_id);

-- Whitelisted senders policies
CREATE POLICY "Users can view own whitelisted senders" ON whitelisted_senders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own whitelisted senders" ON whitelisted_senders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own whitelisted senders" ON whitelisted_senders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own whitelisted senders" ON whitelisted_senders
    FOR DELETE USING (auth.uid() = user_id);

-- Sync logs policies
CREATE POLICY "Users can view own sync logs" ON sync_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync logs" ON sync_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically set completed_at for sync logs
CREATE OR REPLACE FUNCTION update_sync_log_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Set completed_at when status changes to 'completed' or 'error'
    IF NEW.status IN ('completed', 'error') AND OLD.status NOT IN ('completed', 'error') THEN
        NEW.completed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gmail_connections_updated_at
    BEFORE UPDATE ON gmail_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gmail_messages_updated_at
    BEFORE UPDATE ON gmail_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whitelisted_senders_updated_at
    BEFORE UPDATE ON whitelisted_senders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply completed_at trigger to sync logs
CREATE TRIGGER update_sync_logs_completed_at
    BEFORE UPDATE ON sync_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_sync_log_completed_at();

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to create user profile (bypasses RLS for server-side creation)
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

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
    total_transactions BIGINT,
    total_income DECIMAL,
    total_expenses DECIMAL,
    active_gmail_connections BIGINT,
    last_sync_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(t.id) as total_transactions,
        COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN ABS(t.amount) ELSE 0 END), 0) as total_expenses,
        COUNT(DISTINCT gc.id) as active_gmail_connections,
        MAX(gc.last_sync_at) as last_sync_at
    FROM users u
    LEFT JOIN transactions t ON u.id = t.user_id
    LEFT JOIN gmail_connections gc ON u.id = gc.user_id AND gc.is_active = true
    WHERE u.id = user_uuid
    GROUP BY u.id;
END;
$$;

-- Function to clean up old sync logs (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_sync_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM sync_logs
    WHERE created_at < NOW() - INTERVAL '30 days';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for transaction summary by category
CREATE OR REPLACE VIEW transaction_summary_by_category AS
SELECT
    t.user_id,
    t.category,
    t.type,
    COUNT(*) as transaction_count,
    SUM(ABS(t.amount)) as total_amount,
    AVG(ABS(t.amount)) as avg_amount,
    MIN(t.transaction_date) as first_transaction,
    MAX(t.transaction_date) as last_transaction
FROM transactions t
GROUP BY t.user_id, t.category, t.type;

-- View for Gmail connection status
CREATE OR REPLACE VIEW gmail_connection_status AS
SELECT
    gc.user_id,
    gc.id as connection_id,
    gc.gmail_email,
    gc.is_active,
    gc.sync_status,
    gc.last_sync_at,
    gc.error_count,
    COUNT(gm.id) as total_messages_processed,
    COUNT(CASE WHEN gm.is_transaction_email THEN 1 END) as transaction_emails_found,
    COUNT(t.id) as transactions_created
FROM gmail_connections gc
LEFT JOIN gmail_messages gm ON gc.id = gm.gmail_connection_id
LEFT JOIN transactions t ON gc.id = t.gmail_connection_id
GROUP BY gc.user_id, gc.id, gc.gmail_email, gc.is_active, gc.sync_status,
         gc.last_sync_at, gc.error_count;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION create_user_profile_bypass_rls TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile_bypass_rls TO service_role;
GRANT EXECUTE ON FUNCTION get_user_stats TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_sync_logs TO service_role;

-- Grant usage on custom types
GRANT USAGE ON TYPE transaction_type TO authenticated;
GRANT USAGE ON TYPE transaction_category TO authenticated;
GRANT USAGE ON TYPE sync_status TO authenticated;

-- ============================================================================
-- CREATE USER PROFILE FOR CURRENT USER
-- ============================================================================

-- Create user profile for the authenticated user (if running with valid session)
-- This will only work if you're running this script while authenticated
DO $$
BEGIN
    -- Try to create profile for current user if auth.uid() is available
    IF auth.uid() IS NOT NULL THEN
        PERFORM create_user_profile_bypass_rls(
            auth.uid(),
            (SELECT email FROM auth.users WHERE id = auth.uid()),
            (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = auth.uid())
        );
        RAISE NOTICE 'User profile created for current user: %', auth.uid();
    ELSE
        RAISE NOTICE 'No authenticated user found. You can create a profile manually after authentication.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not auto-create user profile: %', SQLERRM;
END;
$$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify all tables were created
SELECT 'Tables created:' as status, array_agg(table_name ORDER BY table_name) as tables
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'gmail_connections', 'transactions', 'gmail_messages', 'whitelisted_senders', 'sync_logs');

-- Verify RLS is enabled
SELECT 'RLS enabled:' as status, array_agg(tablename ORDER BY tablename) as tables
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;

-- Verify functions exist
SELECT 'Functions created:' as status, array_agg(proname ORDER BY proname) as functions
FROM pg_proc
WHERE proname IN ('create_user_profile_bypass_rls', 'get_user_stats', 'cleanup_old_sync_logs');

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

SELECT 'Database setup completed successfully!' as message,
       'You can now test authentication and user profile creation.' as next_steps;
