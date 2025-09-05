# Budget Manager - Implementation Plan

## 🚀 Phase 1: Foundation (Local Dev — MVP Data Ingestion & Core Storage)

**Goal**: Build and validate the Gmail ingestion pipeline fully in local development environment.

### 📋 Functional Requirements
- ✅ User Auth and Data Storage (Supabase local dev instance)
- ✅ Gmail Integration (OAuth + Email fetching)
- ✅ Unique identifier per transaction = Gmail `messageId`
- ✅ One entry per Gmail message (no thread merging)
- ✅ Transaction lifecycle: Review → Saved
- ✅ Hourly fetch of Gmail messages (last 1h)
- ✅ Manual sync button (time range override)
- ✅ Whitelisted sender list (configurable)
- ✅ Dashboard: list of transactions to review
- ✅ Fetch and extract: Payment Method, Amount, Date & Time

### 🔧 Non-Functional Requirements
- Run everything locally (NextJS frontend + NodeJS backend + Supabase docker/dev instance)
- Gmail API via OAuth2 with read-only scope
- Deduplication via `messageId`
- At-most-once entry guarantee
- Observability: console/dev logs for fetch success/failure

### 🗃️ Core Entities
- **User**: Authentication and profile management
- **GmailMessage**: Raw Gmail message data and metadata
- **Transaction**: Extracted transaction data (Review/Saved states)
- **WhitelistedSender**: Approved email senders for transaction extraction

### 🎯 Phase 1 Tasks
1. **Project Setup**
   - Initialize Next.js with TypeScript
   - Configure Supabase local development
   - Set up project documentation

2. **Authentication & Database**
   - Implement Supabase Auth
   - Create core database schema
   - Set up user management

3. **Gmail Integration**
   - Configure Google OAuth2
   - Implement Gmail API client
   - Build message fetching service

4. **Transaction Processing**
   - Create transaction extraction logic
   - Implement deduplication
   - Build review dashboard

5. **Automation**
   - Set up scheduled sync
   - Add manual sync capability
   - Implement whitelisted senders

---

## 📊 Phase 2: User Features & Insights

**Goal**: Empower users to review, manage, and visualize spending patterns.

### 📋 Functional Requirements
- Editable categories and tags
- Daily/monthly expense views
- Budget creation and tracking
- Bill reminders and notifications
- Transaction search and filtering
- Monthly summary exports
- Multi-source balance tracking
- PWA support with offline access

### 🔧 Non-Functional Requirements
- Performance: incremental fetch <2s for 1000+ emails
- Safe handling of multiple accounts
- Track skipped/failed emails in logs

### 🗃️ Additional Entities
- **PaymentMethod**: Credit cards, bank accounts, wallets
- **Category**: Manual categorization system
- **Budget**: Budget creation and tracking
- **Reminder**: Bill reminders and notifications

---

## 🤖 Phase 3: Enhancements & Intelligence

**Goal**: Advanced AI features, multi-account scaling, and collaboration.

### 📋 Functional Requirements
- Multiple Gmail accounts per user
- AI-based merchant category classification
- AI-based spend type classification (essential vs discretionary)
- Receipt photo upload and processing
- Expense splitting with friends

### 🔧 Non-Functional Requirements
- Multi-account scaling with secure token storage
- Performance tuning for larger datasets
- Advanced observability and monitoring

### 🗃️ Additional Entities
- **MultiAccount**: Support for multiple Gmail accounts
- **AICategory**: AI-powered categorization
- **Receipt**: Photo upload and OCR processing
- **ExpenseSplit**: Collaborative expense management

---

## 🌐 Phase 4: Vercel Deployment & Production Readiness

**Goal**: Move from local development to production deployment.

### 📋 Functional Requirements
- Deploy frontend (NextJS) + backend (NodeJS APIs) on Vercel
- Connect to managed Supabase (production instance)
- Secure handling of Gmail OAuth credentials
- CI/CD pipeline for continuous deployment

### 🔧 Non-Functional Requirements
- Domain setup with SSL (via Vercel)
- Error logging and monitoring in production
- Scaling rules: edge caching + API route optimizations
- Production data backups and retention policies

### 🚀 Production Features
- Vercel deployment workflows (preview + prod environments)
- Database migration flow (local → Supabase cloud)
- Monitoring integrations (Logflare, Sentry, etc.)
- Performance optimization and caching strategies

---

## 📅 Implementation Timeline

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Phase 1 | 2-3 weeks | Gmail integration, local setup, basic dashboard |
| Phase 2 | 3-4 weeks | User features, budgeting, expense tracking |
| Phase 3 | 4-5 weeks | AI features, multi-account, collaboration |
| Phase 4 | 1-2 weeks | Production deployment, monitoring |

**Total**: 10-14 weeks

## 🔄 Validation Process

After each phase:
1. **Demo the working features** to validate functionality
2. **Review performance metrics** against requirements
3. **Gather user feedback** for improvements
4. **Update documentation** with lessons learned
5. **Plan adjustments** for next phase if needed
