# System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Gmail API     │    │   Next.js App   │    │   Supabase      │
│                 │    │                 │    │                 │
│ • OAuth2        │◄──►│ • Frontend      │◄──►│ • PostgreSQL    │
│ • Messages      │    │ • API Routes    │    │ • Auth          │
│ • Attachments   │    │ • Middleware    │    │ • Real-time     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔄 Data Flow

### 1. Authentication Flow
```
User → Next.js → Supabase Auth → Google OAuth → Gmail API Access
```

### 2. Transaction Ingestion Flow
```
Gmail API → Message Fetch → Transaction Extraction → Deduplication → Database Storage
```

### 3. User Interaction Flow
```
User Dashboard → Transaction Review → Category Assignment → Budget Tracking
```

## 🗃️ Database Schema (Phase 1)

### Core Tables

#### users
```sql
id: uuid (primary key)
email: text (unique)
created_at: timestamp
updated_at: timestamp
gmail_access_token: encrypted_text
gmail_refresh_token: encrypted_text
last_sync_at: timestamp
```

#### gmail_messages
```sql
id: uuid (primary key)
user_id: uuid (foreign key)
message_id: text (unique) -- Gmail messageId
thread_id: text
subject: text
sender: text
received_at: timestamp
processed_at: timestamp
raw_content: text
created_at: timestamp
```

#### transactions
```sql
id: uuid (primary key)
user_id: uuid (foreign key)
gmail_message_id: uuid (foreign key)
status: enum ('review', 'saved')
amount: decimal
currency: text
merchant: text
payment_method: text
transaction_date: timestamp
category: text (nullable)
notes: text (nullable)
created_at: timestamp
updated_at: timestamp
```

#### whitelisted_senders
```sql
id: uuid (primary key)
user_id: uuid (foreign key)
email_address: text
domain: text
is_active: boolean
created_at: timestamp
```

## 🔧 Component Architecture

### Frontend Components
```
pages/
├── index.tsx (Dashboard)
├── auth/
│   ├── login.tsx
│   └── callback.tsx
├── transactions/
│   ├── index.tsx (List)
│   ├── [id].tsx (Detail)
│   └── review.tsx (Review Queue)
└── settings/
    ├── index.tsx
    └── senders.tsx (Whitelist)

components/
├── layout/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── Layout.tsx
├── transactions/
│   ├── TransactionCard.tsx
│   ├── TransactionList.tsx
│   └── TransactionForm.tsx
└── common/
    ├── Button.tsx
    ├── Modal.tsx
    └── LoadingSpinner.tsx
```

### Backend Services
```
lib/
├── supabase/
│   ├── client.ts
│   ├── auth.ts
│   └── database.ts
├── gmail/
│   ├── client.ts
│   ├── oauth.ts
│   └── parser.ts
├── services/
│   ├── transactionService.ts
│   ├── gmailService.ts
│   └── syncService.ts
└── utils/
    ├── encryption.ts
    ├── validation.ts
    └── logger.ts
```

## 🔐 Security Architecture

### Authentication & Authorization
- **Supabase Auth**: Primary authentication system
- **Google OAuth2**: Gmail API access with minimal scopes
- **JWT Tokens**: Secure session management
- **Row Level Security**: Database-level access control

### Data Protection
- **Encryption at Rest**: Sensitive data encrypted in database
- **Encryption in Transit**: HTTPS/TLS for all communications
- **Token Security**: OAuth tokens encrypted and securely stored
- **Minimal Data Storage**: Only extract necessary transaction data

### API Security
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Sanitize all user inputs
- **CORS Configuration**: Restrict cross-origin requests
- **Environment Variables**: Secure configuration management

## 📊 Performance Considerations

### Caching Strategy
- **Client-side**: React Query for API response caching
- **Server-side**: Next.js API route caching
- **Database**: Supabase connection pooling

### Optimization Techniques
- **Incremental Sync**: Only fetch new messages since last sync
- **Batch Processing**: Process multiple transactions efficiently
- **Lazy Loading**: Load transaction details on demand
- **Image Optimization**: Next.js automatic image optimization

## 🔄 Scalability Planning

### Horizontal Scaling
- **Stateless Design**: API routes without server state
- **Database Scaling**: Supabase automatic scaling
- **CDN Integration**: Vercel Edge Network

### Vertical Scaling
- **Connection Pooling**: Efficient database connections
- **Memory Management**: Optimize large dataset processing
- **Background Jobs**: Async processing for heavy operations

## 🚨 Error Handling & Monitoring

### Error Handling
- **Graceful Degradation**: Fallback for failed operations
- **Retry Logic**: Automatic retry for transient failures
- **User Feedback**: Clear error messages and recovery options

### Monitoring & Observability
- **Application Logs**: Structured logging with context
- **Performance Metrics**: Response times and throughput
- **Error Tracking**: Automatic error reporting
- **Health Checks**: System health monitoring
