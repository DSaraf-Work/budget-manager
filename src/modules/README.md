# Modules Directory

This directory contains feature modules that are implemented separately and cleanly.

## Module Structure

Each module should follow this structure:
```
src/modules/[module-name]/
├── components/          # React components specific to this module
├── hooks/              # Custom hooks for this module
├── services/           # API calls and business logic
├── types/              # TypeScript types for this module
├── utils/              # Utility functions
└── index.ts            # Module exports
```

## Database Tables

All database tables are prefixed with `bm_` (budget manager) to avoid conflicts:
- `bm_users` - User accounts and profiles
- `bm_transactions` - Financial transactions
- `bm_budgets` - Budget definitions
- `bm_categories` - Transaction categories
- etc.

## Planned Modules

1. **auth** - Authentication and user management
2. **profile** - User profile management
3. **transactions** - Transaction tracking and management
4. **budgets** - Budget creation and monitoring
5. **analytics** - Financial insights and reporting
6. **integrations** - External service integrations (Gmail, banks, etc.)

## Implementation Guidelines

- Each module is self-contained
- Modules communicate through well-defined interfaces
- Database operations are isolated within each module
- Components are reusable and follow consistent patterns
- All external dependencies are clearly documented
