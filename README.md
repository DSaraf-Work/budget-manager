# Budget Manager

A comprehensive personal finance management application that automatically ingests transaction data from Gmail, provides intelligent categorization, and offers powerful budgeting and expense tracking capabilities.

## 🚀 Features

### ✅ Implemented (Phase 1)
- **User Authentication**: Secure login with email/password and Google OAuth
- **Gmail Integration**: OAuth2 flow with read-only access and automatic token refresh
- **Transaction Extraction**: Intelligent parsing of transaction emails with confidence scoring
- **Review Dashboard**: Comprehensive UI for reviewing, approving, and managing transactions
- **Automated Sync**: Configurable background sync with manual trigger options
- **Settings Management**: Complete settings interface for Gmail, sync, and account management

### 🔄 Coming Soon (Phase 2+)
- **Smart Categorization**: AI-powered automatic transaction categorization
- **Budget Tracking**: Create and monitor budgets with real-time insights
- **Analytics Dashboard**: Spending patterns and financial insights
- **Multi-account Support**: Connect multiple Gmail accounts
- **Export Features**: CSV/PDF export of transaction data

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Node.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + Google OAuth
- **Email Integration**: Gmail API
- **UI Components**: Lucide React, Headless UI
- **Deployment**: Vercel (planned)

## 📋 Development Status

**Current Phase**: Phase 1 - Foundation Setup ✅ **COMPLETE**

### Phase 1: Foundation (✅ Complete)
- ✅ Project initialization with Next.js and TypeScript
- ✅ Comprehensive documentation and architecture
- ✅ Database schema with Supabase integration
- ✅ User authentication with Google OAuth
- ✅ Gmail OAuth integration and message fetching
- ✅ Intelligent transaction extraction
- ✅ Transaction review dashboard
- ✅ Automated sync scheduling
- ✅ Settings and configuration management

### Ready for Phase 2
- **Phase 2**: User Features & Insights (Budgeting, Analytics, Categories)
- **Phase 3**: AI Enhancements & Intelligence (Multi-account, AI categorization)
- **Phase 4**: Production Deployment (Vercel, CI/CD, Monitoring)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase CLI (for local development)
- Google Cloud Console account (for Gmail API)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd budget-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
budget-manager/
├── docs/                    # Project documentation
│   ├── architecture/        # System architecture docs
│   ├── database/           # Database schema and migrations
│   └── user-stories/       # User stories and requirements
├── src/
│   ├── app/                # Next.js app directory
│   ├── components/         # React components
│   ├── lib/               # Utility libraries
│   │   ├── supabase/      # Supabase client configuration
│   │   └── utils.ts       # Helper functions
│   └── types/             # TypeScript type definitions
├── .env.local.example     # Environment variables template
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Gmail API Configuration
GMAIL_SCOPES=https://www.googleapis.com/auth/gmail.readonly
```

## 📖 Documentation

Comprehensive documentation is available in the `docs/` directory:

- [Project Overview](./docs/project-overview.md)
- [Implementation Plan](./docs/implementation-plan.md)
- [System Architecture](./docs/architecture/system-architecture.md)
- [Database Schema](./docs/database/schema.sql)
- [User Stories](./docs/user-stories/phase1-user-stories.md)

## 🤝 Contributing

This is currently a personal project in active development. Contributions, suggestions, and feedback are welcome!

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
