# Split Transaction System Architecture

## System Overview
Comprehensive split transaction system that allows users to track portions of transactions shared with others, providing accurate personal spending analysis and dual-view capabilities for total vs. personal spending.

## Core Concept & Business Logic

### Split Transaction Model
```
Transaction Amount Breakdown:
├── Total Amount: Full transaction amount (existing)
├── Split Amount: Portion shared with others (new)
├── Personal Amount: User's actual expense (calculated)
└── Split Percentage: Percentage of transaction split
```

### Calculation Logic
- **Personal Amount** = Total Amount - Split Amount
- **Split Percentage** = (Split Amount / Total Amount) × 100
- **Validation Rule**: 0 ≤ Split Amount ≤ Total Amount

### Use Cases
- **Restaurant Bills**: Split dinner costs with friends
- **Group Travel**: Share accommodation and transportation expenses
- **Household Expenses**: Split utilities and rent with roommates
- **Shared Subscriptions**: Divide streaming services and software costs
- **Group Gifts**: Split costs for collective presents

## Data Architecture

### Google Sheets Schema Extensions (Phase 1)
```
Transactions Sheet Columns:
├── D: Split_Amount (Currency format, default 0)
├── E: Personal_Amount (Formula: =C2-D2)
├── X: Is_Split (Formula: =IF(D2>0,TRUE,FALSE))
├── Y: Split_Percentage (Formula: =IF(C2>0,D2/C2*100,0))

Data Validation Rules:
├── Split_Amount: Custom formula =AND(D2>=0,D2<=C2)
├── Amount: Custom formula =C2>0
├── Conditional Formatting: Highlight split transactions
└── Protected Ranges: Protect formula columns from editing

Google Sheets Formulas:
├── Personal_Amount: =IF(ISBLANK(D2),C2,C2-D2)
├── Split_Percentage: =IF(AND(C2>0,D2>0),ROUND(D2/C2*100,2),0)
├── Is_Split: =IF(D2>0,"Yes","No")
└── Validation: =AND(D2>=0,D2<=C2,ISNUMBER(D2))
```

### Migration to PostgreSQL Schema (Phase 2)
```
transactions table additions:
├── split_amount: DECIMAL(12,2) DEFAULT 0
├── personal_amount: Calculated field (amount - split_amount)
├── is_split_transaction: Boolean indicator
└── split_percentage: Calculated percentage

Constraints:
├── split_amount >= 0
├── split_amount <= amount
├── NOT NULL with default 0
└── Precision limited to 2 decimal places
```

### Split Transaction Metadata
- **Split Indicators**: Conditional formatting in Google Sheets for visual markers
- **Split History**: Version history through Google Sheets revision tracking
- **Split Categories**: Separate columns for split-specific categorization
- **Split Notes**: Additional text columns for split arrangement details
- **Split Recipients**: Future enhancement columns for tracking who owes what

### Google Sheets Specific Features
- **Conditional Formatting**: Automatically highlight split transactions
- **Data Validation**: Real-time validation of split amounts
- **Formula Protection**: Protect calculated columns from accidental editing
- **Named Ranges**: Use named ranges for better formula readability
- **Pivot Tables**: Built-in pivot tables for split transaction analysis

### Data Integrity Rules
- **Validation Constraints**: Database-level validation for split amounts
- **Audit Trails**: Complete history of split amount changes
- **Consistency Checks**: Ensure personal amounts are always accurate
- **Migration Safety**: Safe migration of existing transactions
- **Rollback Procedures**: Ability to revert split transaction changes

## Dual View System

### View Type Architecture
```
View Types:
├── Personal View (Default)
│   ├── Shows personal_amount in all displays
│   ├── Excludes split amounts from totals
│   ├── Focuses on actual user expenses
│   └── Default for budgeting and analytics
└── Total View
    ├── Shows full transaction amounts
    ├── Includes all split portions
    ├── Useful for account reconciliation
    └── Optional view for complete picture
```

### View Toggle Implementation
- **Global State Management**: Consistent view across all components
- **User Preference Persistence**: Remember user's preferred view
- **Real-Time Switching**: Instant view updates without page refresh
- **Context-Aware Display**: Appropriate view indicators and explanations
- **Mobile Optimization**: Touch-friendly toggle controls

### View-Specific Features
```
Personal View Features:
├── Split Savings Tracking: Show money saved through splits
├── Personal Budget Analysis: Budget vs. personal spending
├── Personal Spending Trends: Trends based on actual expenses
└── Split Transaction Summary: Overview of splitting activity

Total View Features:
├── Account Reconciliation: Match bank statements
├── Complete Transaction History: Full transaction amounts
├── Tax Preparation: Complete expense records
└── Audit Trail: Full financial activity overview
```

## Analytics Integration

### Personal Spending Analytics
- **Default Analytics**: Use personal amounts for all spending analysis
- **Budget Calculations**: Budget vs. actual based on personal spending
- **Trend Analysis**: Historical trends using personal amounts
- **Goal Tracking**: Savings goals calculated from personal expenses
- **Category Analysis**: Category breakdowns using personal amounts

### Split-Aware Reporting
```
Enhanced Analytics:
├── Split Savings Tracking: Total amount saved through splitting
├── Split Transaction Patterns: Frequency and categories of splits
├── Split Percentage Analysis: Average split percentages by category
├── Split Trend Analysis: Changes in splitting behavior over time
└── Split Category Insights: Which categories are split most often
```

### Comparative Analysis
- **Personal vs. Total Views**: Side-by-side comparison capabilities
- **Split Impact Analysis**: How splits affect spending patterns
- **Budget Variance**: Difference between total and personal budget tracking
- **Savings Calculation**: Money saved through split arrangements
- **Category Impact**: How splits affect category-wise spending

## User Interface Architecture

### Split Amount Input System
- **Intuitive Input**: Easy-to-use split amount entry
- **Real-Time Calculation**: Live personal amount updates
- **Quick Split Options**: Common split percentages (50%, custom)
- **Validation Feedback**: Immediate validation error display
- **Mobile Optimization**: Touch-friendly input controls

### Transaction Display System
```
Transaction List Display:
├── Split Indicators: Visual badges for split transactions
├── Amount Display: Context-aware amount showing
├── Split Breakdown: Detailed split vs. personal breakdown
├── Toggle Integration: Respect global view setting
└── Mobile Adaptation: Optimized for small screens
```

### Dashboard Integration
- **Split-Aware Widgets**: Dashboard widgets respect view settings
- **Split Summary Cards**: Dedicated split transaction summaries
- **View Toggle Controls**: Prominent view switching controls
- **Explanatory Text**: Clear explanations of current view
- **Split Insights**: Insights specific to split transactions

## Processing Workflow

### Transaction Creation Flow
```
User Input → Split Amount Validation → Personal Amount Calculation → Database Storage → Analytics Update
```

### Split Amount Modification Flow
```
Edit Request → Validation → Recalculation → Database Update → Analytics Refresh → UI Update
```

### View Toggle Flow
```
User Toggle → State Update → Data Refetch → Component Refresh → Preference Save
```

### Email Import Integration
- **Split Detection**: Identify potential split transactions from emails
- **Split Suggestions**: AI-powered split amount suggestions
- **User Review**: Present split options during transaction review
- **Default Behavior**: Default to no split for imported transactions
- **Learning System**: Learn user's split patterns over time

## Performance Considerations

### Database Optimization
- **Indexed Queries**: Optimized indexes for split-aware queries
- **Calculated Fields**: Efficient personal amount calculations
- **View Performance**: Fast switching between view types
- **Analytics Caching**: Cached analytics for both view types
- **Query Optimization**: Optimized queries for large datasets

### Frontend Performance
- **State Management**: Efficient state updates for view changes
- **Component Optimization**: Optimized re-rendering for view toggles
- **Data Caching**: Cache data for both view types
- **Lazy Loading**: Load split-specific data only when needed
- **Memory Management**: Efficient memory usage for large transaction lists

## Security & Privacy

### Data Protection
- **Split Amount Security**: Secure storage of split transaction data
- **Access Control**: User-specific access to split information
- **Audit Logging**: Complete audit trail of split amount changes
- **Data Validation**: Server-side validation of all split amounts
- **Privacy Controls**: User control over split transaction visibility

### Business Logic Security
- **Validation Rules**: Strict validation of split amount constraints
- **Calculation Integrity**: Ensure personal amount calculations are always correct
- **Concurrent Updates**: Handle concurrent split amount updates safely
- **Data Consistency**: Maintain consistency across all split-related data
- **Error Recovery**: Graceful recovery from split calculation errors

## Integration Points

### Internal System Integration
- **Transaction Service**: Core transaction management with split support
- **Analytics Service**: Split-aware analytics and reporting
- **User Interface**: Consistent split display across all components
- **Email Import**: Integration with automated transaction import
- **Notification Service**: Alerts for split transaction activities

### External System Integration
- **Banking APIs**: Future integration for split transaction detection
- **Expense Sharing Apps**: Potential integration with Splitwise, etc.
- **Accounting Software**: Export split transaction data for accounting
- **Tax Software**: Proper handling of split transactions for taxes
- **Backup Services**: Secure backup of split transaction data

## Future Enhancements

### Advanced Split Features
```
Planned Enhancements:
├── Multi-Party Splits: Track multiple split recipients
├── Split Categories: Different categories for split portions
├── Recurring Splits: Automatic splitting for recurring transactions
├── Split Settlements: Track when split amounts are paid back
├── Split Requests: Send split requests to friends
├── Group Expense Management: Comprehensive group expense tracking
└── Split Analytics: Advanced analytics for split transactions
```

### Social Features
- **Split Sharing**: Share split transaction details with friends
- **Group Budgets**: Collaborative budgeting for shared expenses
- **Split Notifications**: Notify friends about split transactions
- **Settlement Tracking**: Track who owes what to whom
- **Group Insights**: Analytics for group spending patterns

### Integration Expansions
- **Payment Integration**: Direct payment of split amounts
- **Social Media**: Share split expenses on social platforms
- **Calendar Integration**: Link split transactions to calendar events
- **Location Services**: Automatic split suggestions based on location
- **Contact Integration**: Easy selection of split recipients

## Migration Strategy

### Existing Data Migration
- **Zero Split Default**: All existing transactions default to split_amount = 0
- **Personal Amount Calculation**: Calculate personal amounts for all transactions
- **Analytics Recalculation**: Recalculate all analytics with personal amounts
- **Index Creation**: Create new indexes for split-aware queries
- **Validation**: Ensure all migrated data meets split constraints

### Rollback Procedures
- **Safe Rollback**: Ability to safely remove split functionality
- **Data Preservation**: Preserve original transaction amounts
- **Analytics Restoration**: Restore analytics to pre-split state
- **User Communication**: Clear communication about rollback impacts
- **Testing**: Comprehensive testing of rollback procedures

## Quality Assurance

### Testing Strategy
- **Unit Testing**: Comprehensive testing of split calculations
- **Integration Testing**: End-to-end testing of split workflows
- **Performance Testing**: Ensure split features don't impact performance
- **User Testing**: Validate user experience with split features
- **Edge Case Testing**: Test boundary conditions and error scenarios

### Validation Procedures
- **Data Integrity**: Ensure split amounts always meet constraints
- **Calculation Accuracy**: Verify personal amount calculations
- **View Consistency**: Ensure consistent data across view types
- **Performance Benchmarks**: Maintain performance standards
- **User Acceptance**: Validate user satisfaction with split features
