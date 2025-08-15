# Database Design & Schema Architecture

## Database Strategy
Google Sheets-based data storage for initial implementation, designed for rapid prototyping and cost-effective development, with a clear migration path to PostgreSQL for production scaling.

## Core Design Principles

### Phase 1: Google Sheets Implementation
- **Simplicity**: Sheet-based data organization for rapid development
- **Cost Efficiency**: Zero database hosting costs during development
- **Data Validation**: Built-in Google Sheets validation rules
- **Collaboration**: Native sharing and access control via Google Drive
- **API Integration**: Google Sheets API for programmatic access

### Phase 2: PostgreSQL Migration (Future)
- **Data Integrity**: ACID compliance with strict validation constraints
- **Performance**: Optimized indexes and query patterns for analytics
- **Scalability**: Partitioning strategy for large transaction volumes
- **Security**: Row-level security and encryption for sensitive data
- **Auditability**: Complete audit trails for compliance requirements

## Google Sheets Structure (Phase 1)

### Master Spreadsheet Organization
```
Budget Manager Spreadsheet:
├── Users Sheet
├── Transactions Sheet
├── Categories Sheet
├── Accounts Sheet
├── Email_Processing_Log Sheet
├── Trusted_Senders Sheet
├── Analytics_Cache Sheet
└── Settings Sheet
```

### Users Sheet Structure
```
Columns:
├── A: User_ID (Text, Primary Key)
├── B: Email (Email validation)
├── C: Display_Name (Text)
├── D: Gmail_Token (Text, encrypted)
├── E: Default_Currency (Text, default "USD")
├── F: Timezone (Text)
├── G: Created_At (Timestamp)
├── H: Last_Login (Timestamp)
├── I: Preferences (JSON text)
└── J: Status (Data validation: Active/Inactive)

Data Validation:
├── Email: Email format validation
├── Default_Currency: List validation (USD, EUR, GBP, etc.)
├── Status: List validation (Active, Inactive)
└── Timezone: List validation from predefined timezones
```

### Transactions Sheet Structure
```
Columns:
├── A: Transaction_ID (Auto-generated: =ROW())
├── B: User_ID (Text, references Users sheet)
├── C: Amount (Currency format, >0 validation)
├── D: Split_Amount (Currency format, default 0)
├── E: Personal_Amount (Formula: =C2-D2)
├── F: Currency (Text, default "USD")
├── G: Transaction_Date (Date format)
├── H: Transaction_Time (Time format)
├── I: Merchant_Name (Text)
├── J: Merchant_Standardized (Text)
├── K: Category (Data validation from Categories sheet)
├── L: Subcategory (Data validation, dependent on Category)
├── M: Description (Text)
├── N: Account_ID (Text, references Accounts sheet)
├── O: Transaction_Type (List: Debit, Credit, Transfer)
├── P: Email_Source (Email format)
├── Q: Gmail_Message_ID (Text, unique)
├── R: AI_Confidence_Score (Number, 0-1)
├── S: AI_Notes (Text)
├── T: User_Notes (Text)
├── U: Review_Status (List: Pending, Approved, Rejected)
├── V: Created_At (Timestamp)
├── W: Updated_At (Timestamp)
└── X: Is_Split (Formula: =IF(D2>0,TRUE,FALSE))

Data Validation Rules:
├── Amount: Custom formula =C2>0
├── Split_Amount: Custom formula =AND(D2>=0,D2<=C2)
├── Category: List from Categories!A:A
├── Transaction_Type: List (Debit, Credit, Transfer)
├── Review_Status: List (Pending, Approved, Rejected)
└── Email_Source: Email format validation
```

### Categories Sheet Structure
```
Columns:
├── A: Category_Name (Text, unique)
├── B: Parent_Category (Text, optional)
├── C: Icon (Text, emoji or icon name)
├── D: Color (Text, hex color code)
├── E: Budget_Default (Currency)
├── F: User_ID (Text, for custom categories)
├── G: Is_Default (Boolean, system categories)
└── H: Sort_Order (Number)

Pre-populated Categories:
├── Food & Dining
├── Transportation
├── Shopping
├── Entertainment
├── Bills & Utilities
├── Healthcare
├── Personal Care
└── Income
```

### Email Import System
```
email_processing_log
├── Email processing status and error tracking
├── Gmail message ID mapping
├── Processing timestamps and retry logic
└── Error categorization and debugging info

trusted_email_senders
├── Whitelisted sender management
├── Institution type classification
├── Auto-approval settings
└── Sender-specific parsing rules
```

### Analytics & Reporting
```
transaction_analytics_cache
├── Pre-computed analytics for performance
├── Time-based aggregations (daily, monthly, yearly)
├── Category and merchant breakdowns
└── Cache invalidation and refresh logic

spending_patterns
├── AI-detected spending patterns
├── Recurring transaction identification
├── Anomaly detection and alerts
└── User acknowledgment tracking
```

## Data Relationships

### Core Entity Relationships
- **Users** → **Accounts** (1:N): Users can have multiple financial accounts
- **Accounts** → **Transactions** (1:N): Each transaction belongs to one account
- **Users** → **Categories** (1:N): Users can customize their category structure
- **Categories** → **Transactions** (N:1): Transactions are categorized
- **Users** → **Trusted Senders** (1:N): Users manage their email sender whitelist

### Email Integration Relationships
- **Transactions** → **Email Processing Log** (1:1): Each imported transaction links to email
- **Gmail Messages** → **Transactions** (1:1): Direct mapping via gmail_message_id
- **Trusted Senders** → **Email Processing** (1:N): Sender rules affect processing

### Analytics Relationships
- **Users** → **Analytics Cache** (1:N): Pre-computed user-specific analytics
- **Transactions** → **Spending Patterns** (N:1): Patterns derived from transaction data
- **Categories** → **Budget Rules** (1:N): Category-specific budgeting logic

## Split Transaction Design

### Split Amount Architecture
```
Transaction Amount Breakdown:
├── total_amount: Full transaction amount
├── split_amount: Amount split with others (0 to total_amount)
├── personal_amount: Calculated field (total_amount - split_amount)
└── split_percentage: Calculated percentage of split
```

### Split Transaction Constraints
- **Range Validation**: `0 <= split_amount <= total_amount`
- **Precision**: Maximum 2 decimal places for currency amounts
- **Business Logic**: Income transactions typically have split_amount = 0
- **Audit Trail**: All split amount changes are logged

### Personal Spending Calculations
- **Default Analytics**: Use personal_amount for spending analysis
- **Budget Tracking**: Budget vs. actual uses personal amounts
- **Trend Analysis**: Historical trends based on personal spending
- **Goal Tracking**: Savings goals calculated from personal amounts

## Email Import Schema

### Email Processing Pipeline
```
Email Detection → Content Extraction → AI Processing → Transaction Creation → User Review
```

### Email Metadata Storage
- **Gmail Message ID**: Unique identifier for email linking
- **Email Subject**: For user reference and debugging
- **Sender Information**: For trusted sender management
- **Processing Status**: Tracking through import pipeline
- **Error Handling**: Detailed error logs for troubleshooting

### AI Processing Metadata
- **Confidence Scoring**: AI categorization confidence (0.0 to 1.0)
- **Processing Notes**: AI reasoning and categorization logic
- **Merchant Standardization**: Cleaned merchant names
- **Category Suggestions**: Primary and alternative categories
- **Error Recovery**: Fallback processing for AI failures

## Performance Optimization

### Indexing Strategy
```
Primary Indexes:
├── User-based queries (user_id + date ranges)
├── Category analysis (user_id + category + date)
├── Email processing (gmail_message_id, email_source)
├── Split transactions (user_id + split_amount > 0)
└── Analytics queries (user_id + aggregation fields)

Composite Indexes:
├── Transaction analytics (user_id, date, category, personal_amount)
├── Email import tracking (user_id, email_source, processing_status)
├── Split transaction analysis (user_id, split_amount, category)
└── Performance monitoring (created_at, updated_at, user_id)
```

### Partitioning Strategy
- **Time-based Partitioning**: Transactions partitioned by year
- **User-based Sharding**: Future consideration for large user bases
- **Archive Strategy**: Automated archival of old transactions
- **Query Optimization**: Partition pruning for date-range queries

### Caching Architecture
- **Analytics Cache**: Pre-computed monthly/yearly summaries
- **Category Cache**: Frequently accessed category hierarchies
- **User Preferences**: Cached user settings and preferences
- **Email Sender Cache**: Trusted sender lists for fast lookup

## Data Security & Privacy

### Encryption Strategy
- **At Rest**: Database-level encryption for sensitive fields
- **In Transit**: TLS encryption for all data transmission
- **Application Level**: Additional encryption for PII data
- **Key Management**: Secure key rotation and storage

### Access Control
- **Row Level Security**: Users can only access their own data
- **API Authentication**: JWT-based access control
- **Admin Access**: Separate admin roles with audit logging
- **Data Masking**: Sensitive data masking in non-production environments

### Compliance Requirements
- **Data Retention**: Configurable retention policies
- **Right to Deletion**: Complete data removal capabilities
- **Audit Logging**: All data access and modifications logged
- **Export Capabilities**: User data portability requirements

## Scalability Considerations

### Horizontal Scaling
- **Read Replicas**: Separate read replicas for analytics queries
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Optimized queries for large datasets
- **Background Processing**: Async processing for heavy operations

### Data Growth Management
- **Archival Strategy**: Automated archival of historical data
- **Compression**: Data compression for archived transactions
- **Cleanup Procedures**: Automated cleanup of temporary data
- **Monitoring**: Database size and performance monitoring

## Integration Points

### External System Integration
- **Gmail API**: OAuth token storage and refresh management
- **AI Services**: API key management and rate limiting
- **Banking APIs**: Future integration preparation
- **Analytics Services**: Data export for business intelligence

### Internal System Integration
- **Authentication Service**: User management and session handling
- **Email Processing Service**: Transaction import pipeline
- **Analytics Service**: Real-time and batch analytics processing
- **Notification Service**: User alerts and system notifications

## Migration & Deployment

### Schema Evolution
- **Version Control**: Database schema version management
- **Migration Scripts**: Automated schema updates
- **Rollback Procedures**: Safe rollback mechanisms
- **Testing Strategy**: Migration testing in staging environments

### Backup & Recovery
- **Automated Backups**: Regular database backups
- **Point-in-Time Recovery**: Transaction-level recovery capabilities
- **Disaster Recovery**: Cross-region backup replication
- **Recovery Testing**: Regular recovery procedure testing
