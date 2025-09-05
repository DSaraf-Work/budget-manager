-- Budget Manager Database Schema
-- Phase 1: Core Foundation Tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    gmail_access_token TEXT, -- Encrypted
    gmail_refresh_token TEXT, -- Encrypted
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_frequency_hours INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gmail messages table
CREATE TABLE public.gmail_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    message_id TEXT UNIQUE NOT NULL, -- Gmail messageId for deduplication
    thread_id TEXT NOT NULL,
    subject TEXT,
    sender_email TEXT NOT NULL,
    sender_name TEXT,
    received_at TIMESTAMP WITH TIME ZONE NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processed', 'failed', 'skipped')),
    raw_content TEXT, -- Minimal content for transaction extraction
    snippet TEXT,
    labels TEXT[], -- Gmail labels
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    gmail_message_id UUID REFERENCES public.gmail_messages(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'review' CHECK (status IN ('review', 'saved', 'ignored')),
    amount DECIMAL(12, 2) NOT NULL,
    currency TEXT DEFAULT 'INR' NOT NULL,
    merchant TEXT,
    payment_method TEXT, -- Credit Card, Debit Card, UPI, etc.
    payment_method_last4 TEXT, -- Last 4 digits of card
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    transaction_type TEXT CHECK (transaction_type IN ('debit', 'credit', 'transfer')),
    category TEXT,
    subcategory TEXT,
    description TEXT,
    notes TEXT,
    is_recurring BOOLEAN DEFAULT false,
    confidence_score DECIMAL(3, 2), -- AI confidence (0.00 to 1.00)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Whitelisted senders table
CREATE TABLE public.whitelisted_senders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    email_address TEXT,
    domain TEXT,
    sender_name TEXT,
    is_active BOOLEAN DEFAULT true,
    auto_approve BOOLEAN DEFAULT false, -- Auto-approve transactions from this sender
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_email_or_domain CHECK (
        (email_address IS NOT NULL AND domain IS NULL) OR
        (email_address IS NULL AND domain IS NOT NULL)
    )
);

-- Sync logs table for monitoring
CREATE TABLE public.sync_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    sync_type TEXT DEFAULT 'scheduled' CHECK (sync_type IN ('scheduled', 'manual')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
    messages_fetched INTEGER DEFAULT 0,
    transactions_created INTEGER DEFAULT 0,
    transactions_updated INTEGER DEFAULT 0,
    error_message TEXT,
    sync_range_start TIMESTAMP WITH TIME ZONE,
    sync_range_end TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_gmail_messages_user_id ON public.gmail_messages(user_id);
CREATE INDEX idx_gmail_messages_message_id ON public.gmail_messages(message_id);
CREATE INDEX idx_gmail_messages_received_at ON public.gmail_messages(received_at);
CREATE INDEX idx_gmail_messages_processing_status ON public.gmail_messages(processing_status);

CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_transaction_date ON public.transactions(transaction_date);
CREATE INDEX idx_transactions_merchant ON public.transactions(merchant);
CREATE INDEX idx_transactions_category ON public.transactions(category);

CREATE INDEX idx_whitelisted_senders_user_id ON public.whitelisted_senders(user_id);
CREATE INDEX idx_whitelisted_senders_email ON public.whitelisted_senders(email_address);
CREATE INDEX idx_whitelisted_senders_domain ON public.whitelisted_senders(domain);

CREATE INDEX idx_sync_logs_user_id ON public.sync_logs(user_id);
CREATE INDEX idx_sync_logs_started_at ON public.sync_logs(started_at);

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmail_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whitelisted_senders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own gmail messages" ON public.gmail_messages
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own whitelisted senders" ON public.whitelisted_senders
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sync logs" ON public.sync_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gmail_messages_updated_at BEFORE UPDATE ON public.gmail_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whitelisted_senders_updated_at BEFORE UPDATE ON public.whitelisted_senders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
