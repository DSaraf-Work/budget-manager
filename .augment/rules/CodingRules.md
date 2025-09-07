---
type: "manual"
---

# Comprehensive Coding Rules for Budget Manager

## 🎯 CORE PRINCIPLES

### Quality is Non-Negotiable:
- **ALWAYS** test thoroughly before marking tasks complete
- **NEVER** deliver untested code or code with known bugs
- **ALWAYS** follow established patterns and conventions
- **ALWAYS** implement proper error handling
- **ALWAYS** document code with meaningful comments

## 🚨 MANDATORY TESTING REQUIREMENTS

### Before Marking ANY Task Complete:
- **ALWAYS** test thoroughly using available MCP tools (browser automation, API testing, database queries)
- **NEVER** deliver untested code or code with known bugs
- Test happy path, edge cases, error scenarios, and integration with existing features
- Fix any issues immediately and re-test before delivery
- Verify no console errors or warnings exist

### Testing Scope:
- **Happy Path**: Normal user flows work correctly
- **Edge Cases**: Boundary conditions, empty states, invalid inputs
- **Error Scenarios**: Network failures, database errors, authentication issues
- **Integration**: New features work with existing code
- **Performance**: Acceptable load times and resource usage

## 🏗️ CODE QUALITY & ARCHITECTURE STANDARDS

### Core Principles:
- **Simplicity First**: Keep implementations simple, straightforward, and readable
- **Reusability**: Write components/functions usable across multiple contexts
- **Modularity**: Self-contained modules with clear, single responsibilities
- **Separation of Concerns**: UI, business logic, and data access properly separated
- **DRY Principle**: Extract common functionality into shared utilities

### Module Structure (ALWAYS follow):
```
src/modules/[feature]/
├── components/     # Feature-specific UI components
├── hooks/         # Custom React hooks
├── services/      # API calls and business logic
├── types/         # TypeScript type definitions
├── utils/         # Helper functions
└── index.ts       # Module exports
```

### Database Conventions:
- **Table Prefix**: ALL tables MUST use `bm_` prefix (budget manager)
- **RLS**: Enable Row Level Security on ALL tables
- **Indexes**: Create for performance-critical queries
- **Foreign Keys**: Proper relationships and constraints
- **Migrations**: ALWAYS use migration scripts for schema changes

## 🗄️ DATABASE ANALYSIS & MIGRATION REQUIREMENTS

### MANDATORY Database Analysis Process:
Before implementing any feature that requires database changes:

1. **Analyze Current Schema** using Supabase MCP tools:
   - Use `list_tables_supabase` to identify existing tables with `bm_` prefix
   - Use `execute_sql_supabase` to examine table structures, constraints, and indexes
   - Review existing Row Level Security (RLS) policies and permissions
   - Check `list_migrations_supabase` for migration history

2. **Identify Required Changes** based on code flows:
   - Determine if new tables need creation with `bm_` prefix
   - Identify missing columns, indexes, or foreign key relationships
   - Check if RLS policies need updates for new user access patterns
   - Plan data relationships and constraints

3. **Create Proper Migrations** following established rules:
   - Use `apply_migration_supabase` to implement schema changes
   - Follow naming convention: `YYYYMMDD_HHMMSS_descriptive_name`
   - Include table creation, RLS policies, indexes, and verification queries
   - Ensure all tables use `bm_` prefix with proper user ownership policies

4. **Verify Changes** thoroughly:
   - Test that new tables and policies work correctly
   - Confirm RLS policies allow appropriate user access
   - Validate database schema supports intended code functionality
   - Use `execute_sql_supabase` to verify migration success

### MANDATORY Migration Process:
Whenever creating new tables or making database schema changes:

1. **ALWAYS create Supabase migration scripts** instead of creating tables directly
2. **File naming convention**: `database/migrations/YYYYMMDD_HHMMSS_descriptive_name.sql`
3. **Table naming**: ALL tables MUST use `bm_` prefix (budget manager)

### Required Components in Every Migration:
- **Table creation** with proper column types and constraints
- **Primary keys, foreign keys, and indexes**
- **Row Level Security (RLS) policies** appropriate for table functionality
- **CRUD policies** (INSERT, SELECT, UPDATE, DELETE) based on user ownership
- **Service role policies** for administrative operations
- **Proper grants** for authenticated and service_role users
- **Verification queries** to confirm migration success
- **Rollback instructions** documented in comments

### RLS Policy Templates:
```sql
-- User data access (most common)
CREATE POLICY "users_own_data" ON bm_table_name
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "service_role_access" ON bm_table_name
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Public read access (if needed)
CREATE POLICY "public_read" ON bm_table_name
    FOR SELECT TO authenticated
    USING (true);
```

### Migration Script Structure:
```sql
-- ============================================================================
-- MIGRATION: [Description]
-- Created: YYYY-MM-DD HH:MM:SS
-- ============================================================================

-- Create table
CREATE TABLE bm_table_name (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- other columns
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_bm_table_name_user_id ON bm_table_name(user_id);

-- Enable RLS
ALTER TABLE bm_table_name ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "users_own_data" ON bm_table_name
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON bm_table_name TO authenticated;
GRANT ALL ON bm_table_name TO service_role;

-- Verification
SELECT 'Migration completed successfully' as status,
       'bm_table_name created with RLS enabled' as details;

-- Rollback instructions (commented):
-- DROP TABLE IF EXISTS bm_table_name;
```

## 📝 DOCUMENTATION REQUIREMENTS

### Code Comments (MANDATORY for):
- **Purpose**: What the code does
- **Rationale**: Why this approach was chosen
- **Assumptions**: Important limitations or assumptions
- **Complex Logic**: Explain algorithms or business rules
- **API Contracts**: Document inputs/outputs

### Comment Template:
```typescript
/**
 * [Brief description of functionality]
 *
 * [Explanation of why this approach was chosen]
 * [Any important assumptions or limitations]
 *
 * @param param1 - Description of parameter
 * @returns Description of return value
 */
```

## 🔒 ERROR HANDLING STANDARDS

### Requirements:
- **ALWAYS** implement proper error handling
- Provide meaningful error messages to users
- Log detailed error information for debugging
- Use try-catch blocks for async operations
- Validate inputs at function boundaries
- Return appropriate HTTP status codes for APIs

## 🎯 TECHNOLOGY-SPECIFIC RULES

### Next.js/React:
- Use functional components with hooks
- Implement proper loading and error states
- Follow React best practices for state management
- Use TypeScript for ALL components and props

### API Design:
- RESTful endpoints with proper HTTP methods
- Consistent error response format
- Input validation on ALL endpoints
- Proper authentication and authorization

### Database (Supabase):
- Use `bm_` prefix for all tables
- Enable RLS on all tables
- Create proper indexes
- Use transactions for multi-table operations

## ✅ DELIVERY STANDARDS

### Definition of Done:
- ✅ All functionality works as specified
- ✅ All tests pass (happy path, edge cases, errors)
- ✅ No console errors or warnings
- ✅ Code follows quality standards
- ✅ Documentation updated
- ✅ Integration verified
- ✅ Database migrations created (if schema changes)
- ✅ User can successfully use the feature

### NEVER Deliver:
- ❌ Untested code
- ❌ Code with known bugs
- ❌ Code breaking existing functionality
- ❌ Code without proper error handling
- ❌ Code not following established patterns

## 🔄 DEVELOPMENT WORKFLOW

1. **Plan**: Understand requirements, design architecture
2. **Analyze Database**: Use MCP tools to examine current schema and plan changes
3. **Create Migrations**: Implement database changes using proper migration scripts
4. **Implement**: Write core functionality with error handling
5. **Test**: Execute comprehensive testing scenarios (including database operations)
6. **Fix**: Address any issues found during testing
7. **Document**: Add comments and update documentation
8. **Review**: Ensure all quality standards met
9. **Deliver**: Present working, tested feature

## 📋 QUICK CHECKLIST (Use for Every Feature)

### Before Delivery:
- [ ] Database schema analyzed using MCP tools (if schema changes needed)
- [ ] Database migrations created and tested (if schema changes)
- [ ] Feature tested using MCP tools
- [ ] Happy path scenarios work
- [ ] Edge cases handled
- [ ] Error scenarios tested
- [ ] Integration verified
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Code properly commented
- [ ] Follows established patterns
- [ ] Documentation updated

## 🎯 SUMMARY: ESSENTIAL RULES FOR EVERY TASK

### 🔍 BEFORE STARTING:
1. **Analyze Database**: Use `list_tables_supabase` and `execute_sql_supabase` to understand current schema
2. **Plan Architecture**: Design modular structure following established patterns
3. **Identify Changes**: Determine what database migrations are needed

### 🏗️ DURING IMPLEMENTATION:
1. **Create Migrations**: Use `apply_migration_supabase` for any schema changes with `bm_` prefix
2. **Follow Patterns**: Use established module structure and coding conventions
3. **Handle Errors**: Implement proper error handling throughout
4. **Document Code**: Add meaningful comments explaining purpose and rationale

### 🧪 BEFORE DELIVERY:
1. **Test Thoroughly**: Use browser automation, API testing, database queries
2. **Verify Integration**: Ensure new features work with existing code
3. **Check Performance**: Confirm acceptable load times and resource usage
4. **Validate Security**: Test RLS policies and user access controls

### ✅ DELIVERY CRITERIA:
- All functionality works as specified
- All tests pass (happy path, edge cases, errors)
- No console errors or warnings
- Database migrations created and tested (if schema changes)
- Code properly documented and follows patterns
- User can successfully use the feature

**Remember: Quality is not negotiable. Test everything, document everything, follow patterns.**