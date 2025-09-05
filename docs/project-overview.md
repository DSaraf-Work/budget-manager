# Budget Manager - Project Overview

## 🎯 Vision

A comprehensive personal finance management application that automatically ingests transaction data from Gmail, provides intelligent categorization, and offers powerful budgeting and expense tracking capabilities.

## 🚀 Core Value Proposition

- **Automated Data Ingestion**: Seamlessly extract transaction data from Gmail messages
- **Intelligent Categorization**: AI-powered merchant and expense type classification
- **Comprehensive Tracking**: Multi-source balance tracking (banks, cards, wallets, Sodexo)
- **Smart Budgeting**: Create and monitor budgets with real-time insights
- **Collaborative Features**: Split expenses with friends and family

## 🎯 Target Users

- **Primary**: Tech-savvy individuals who receive transaction notifications via Gmail
- **Secondary**: Small families wanting to track shared expenses
- **Tertiary**: Young professionals starting their financial journey

## 🔑 Key Features

### Core Features (Phase 1)
- Gmail OAuth integration with read-only access
- Automated transaction extraction from email notifications
- Deduplication using Gmail messageId
- Transaction review and approval workflow
- Whitelisted sender management
- Manual sync with time range override

### Enhanced Features (Phase 2)
- Editable categories and tags
- Daily/monthly expense views
- Budget creation and tracking
- Bill reminders and notifications
- Transaction search and filtering
- Monthly summary exports
- PWA support with offline access

### Advanced Features (Phase 3)
- Multi-Gmail account support
- AI-based merchant categorization
- Receipt photo upload and processing
- Expense splitting with friends
- Advanced analytics and insights

### Production Features (Phase 4)
- Vercel deployment with CI/CD
- Production Supabase integration
- Advanced monitoring and observability
- Scalable architecture optimizations

## 🏗️ Technical Stack

- **Frontend**: Next.js 14+ with TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Node.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + Google OAuth
- **Email Integration**: Gmail API
- **Deployment**: Vercel
- **Monitoring**: Vercel Analytics, Supabase Observability

## 🔒 Security & Privacy

- OAuth2 with minimal required scopes (Gmail read-only)
- Secure token storage in Supabase
- No email content storage (only extracted transaction data)
- User data encryption at rest
- GDPR compliance considerations

## 📊 Success Metrics

- **User Engagement**: Daily/weekly active users
- **Data Quality**: Transaction extraction accuracy (>95%)
- **Performance**: Email processing time (<2s for 1000+ emails)
- **Reliability**: System uptime (>99.9%)
- **User Satisfaction**: Feature adoption rates

## 🗓️ Timeline

- **Phase 1**: 2-3 weeks (Foundation & Gmail Integration)
- **Phase 2**: 3-4 weeks (User Features & Insights)
- **Phase 3**: 4-5 weeks (AI & Advanced Features)
- **Phase 4**: 1-2 weeks (Production Deployment)

**Total Estimated Duration**: 10-14 weeks
