# 🗃️ Database & Data Testing Checklist

## Prerequisites
- [ ] Supabase project is set up and accessible
- [ ] Database schema has been applied
- [ ] Application is connected to database
- [ ] User authentication is working

---

## 1. Database Schema Validation

### Table Structure
- [ ] `users` table exists with correct columns
- [ ] `gmail_messages` table exists with correct columns
- [ ] `transactions` table exists with correct columns
- [ ] `whitelisted_senders` table exists with correct columns
- [ ] `sync_logs` table exists with correct columns

### Column Constraints
- [ ] Primary keys are properly defined
- [ ] Foreign key relationships are correct
- [ ] NOT NULL constraints are applied correctly
- [ ] CHECK constraints work as expected
- [ ] Default values are set appropriately

### Indexes
- [ ] Performance indexes are created
- [ ] Unique indexes prevent duplicates
- [ ] Foreign key indexes exist
- [ ] Query performance is acceptable

---

## 2. Row Level Security (RLS)

### RLS Policy Testing
- [ ] Users can only access their own data
- [ ] Cannot access other users' transactions
- [ ] Cannot access other users' Gmail messages
- [ ] Cannot access other users' sync logs
- [ ] Cannot access other users' whitelisted senders

### Authentication Integration
- [ ] RLS works with Supabase Auth
- [ ] Unauthenticated users cannot access data
- [ ] User ID filtering works correctly
- [ ] Policy violations are handled gracefully

---

## 3. User Data Management

### User Profile Creation
- [ ] New user profiles are created correctly
- [ ] User ID matches Supabase Auth user ID
- [ ] Email is stored correctly
- [ ] Default values are applied
- [ ] Timestamps are set correctly

### User Profile Updates
- [ ] Can update user profile information
- [ ] Gmail tokens are stored securely
- [ ] Last sync time is updated correctly
- [ ] Profile changes persist correctly

### User Data Deletion
- [ ] User deletion cascades correctly
- [ ] All related data is removed
- [ ] No orphaned records remain
- [ ] Foreign key constraints work

---

## 4. Gmail Message Data

### Message Storage
- [ ] Gmail messages are stored correctly
- [ ] Message ID deduplication works
- [ ] All required fields are populated
- [ ] Message content is stored appropriately
- [ ] Labels array is handled correctly

### Message Processing Status
- [ ] Processing status updates correctly
- [ ] Processed timestamp is set
- [ ] Status transitions work properly
- [ ] Failed processing is tracked

### Message Queries
- [ ] Can retrieve messages by user
- [ ] Can filter by processing status
- [ ] Can sort by received date
- [ ] Pagination works correctly

---

## 5. Transaction Data Management

### Transaction Creation
- [ ] Transactions are created with all required fields
- [ ] Foreign key to Gmail message works
- [ ] Amount and currency are stored correctly
- [ ] Transaction date is stored properly
- [ ] Confidence score is within valid range

### Transaction Updates
- [ ] Can update transaction status
- [ ] Can modify transaction details
- [ ] Updated timestamp is set correctly
- [ ] Changes persist correctly

### Transaction Queries
- [ ] Can retrieve transactions by user
- [ ] Can filter by status (review/saved/ignored)
- [ ] Can sort by transaction date
- [ ] Can search by merchant name
- [ ] Pagination works for large datasets

---

## 6. Whitelisted Senders Management

### Sender Creation
- [ ] Can add email-based whitelisted senders
- [ ] Can add domain-based whitelisted senders
- [ ] Constraint prevents both email and domain
- [ ] Default senders are created for new users

### Sender Queries
- [ ] Can check if sender is whitelisted
- [ ] Domain matching works correctly
- [ ] Email matching works correctly
- [ ] Active/inactive filtering works

### Sender Management
- [ ] Can enable/disable senders
- [ ] Can delete senders
- [ ] Can update sender information
- [ ] Changes affect message processing

---

## 7. Sync Logging

### Sync Log Creation
- [ ] Sync logs are created for each sync
- [ ] All required fields are populated
- [ ] Start time is recorded correctly
- [ ] Sync type is recorded correctly

### Sync Log Updates
- [ ] Completion time is recorded
- [ ] Status is updated correctly
- [ ] Statistics are recorded accurately
- [ ] Error messages are stored

### Sync Log Queries
- [ ] Can retrieve logs by user
- [ ] Can filter by sync type
- [ ] Can sort by date
- [ ] Can get latest sync information

---

## 8. Data Integrity

### Referential Integrity
- [ ] Foreign key constraints work
- [ ] Cannot create orphaned records
- [ ] Cascade deletes work correctly
- [ ] Data relationships are maintained

### Data Validation
- [ ] Email format validation works
- [ ] Amount validation prevents negative values
- [ ] Date validation works correctly
- [ ] Enum constraints work properly

### Unique Constraints
- [ ] Gmail message ID uniqueness is enforced
- [ ] User email uniqueness is enforced
- [ ] No duplicate transactions are created
- [ ] Constraint violations are handled

---

## 9. Performance Testing

### Query Performance
- [ ] User data queries are fast (<100ms)
- [ ] Transaction queries are fast (<200ms)
- [ ] Large dataset queries perform well
- [ ] Indexes improve query performance

### Insert Performance
- [ ] Bulk inserts perform well
- [ ] Transaction creation is fast
- [ ] Message storage is efficient
- [ ] No performance degradation with large datasets

### Update Performance
- [ ] Status updates are fast
- [ ] Bulk updates perform well
- [ ] Concurrent updates work correctly
- [ ] No locking issues

---

## 10. Backup & Recovery

### Data Backup
- [ ] Database backups are configured
- [ ] Backup process works correctly
- [ ] Backup data is complete
- [ ] Backup schedule is appropriate

### Data Recovery
- [ ] Can restore from backup
- [ ] Data integrity after restore
- [ ] No data loss during recovery
- [ ] Recovery process is documented

---

## 11. Concurrent Access

### Multiple Users
- [ ] Multiple users can access simultaneously
- [ ] No data conflicts between users
- [ ] Performance remains good with multiple users
- [ ] RLS works with concurrent access

### Concurrent Operations
- [ ] Multiple syncs can run simultaneously
- [ ] Transaction processing handles concurrency
- [ ] Database locks work correctly
- [ ] No deadlocks occur

---

## 12. Data Migration

### Schema Changes
- [ ] Schema migrations work correctly
- [ ] Data is preserved during migrations
- [ ] Migration rollback works
- [ ] No data corruption during migration

### Data Format Changes
- [ ] Data format changes are handled
- [ ] Legacy data remains accessible
- [ ] Migration scripts work correctly
- [ ] No data loss during format changes

---

## 13. Error Handling

### Database Errors
- [ ] Connection errors are handled gracefully
- [ ] Constraint violations are caught
- [ ] Transaction rollbacks work correctly
- [ ] Error messages are informative

### Data Validation Errors
- [ ] Invalid data is rejected
- [ ] Validation errors are clear
- [ ] Partial failures are handled
- [ ] Data consistency is maintained

---

## 14. Security Testing

### SQL Injection Prevention
- [ ] Parameterized queries are used
- [ ] No SQL injection vulnerabilities
- [ ] Input sanitization works
- [ ] Dynamic queries are safe

### Data Encryption
- [ ] Sensitive data is encrypted at rest
- [ ] Encryption keys are secure
- [ ] Encrypted data can be decrypted
- [ ] Encryption performance is acceptable

---

## 15. Monitoring & Logging

### Database Monitoring
- [ ] Database performance is monitored
- [ ] Query performance is tracked
- [ ] Resource usage is monitored
- [ ] Alerts work for issues

### Audit Logging
- [ ] Data changes are logged
- [ ] User actions are tracked
- [ ] Audit trail is complete
- [ ] Logs are secure and tamper-proof

---

## ✅ Database & Data Testing Summary

**Total Tests**: 90+ individual test cases

**Critical Path Tests** (Must Pass):
- [ ] Database schema is correct and complete
- [ ] Row Level Security works properly
- [ ] Data CRUD operations work correctly
- [ ] Foreign key relationships are maintained
- [ ] Query performance is acceptable
- [ ] Data integrity is preserved

**Security Tests** (Must Pass):
- [ ] RLS prevents unauthorized access
- [ ] SQL injection is prevented
- [ ] Sensitive data is encrypted
- [ ] Audit logging works correctly

**Performance Tests** (Must Pass):
- [ ] Queries complete in acceptable time
- [ ] Large datasets are handled efficiently
- [ ] Concurrent access works properly
- [ ] No performance degradation over time

**Data Quality Tests** (Must Pass):
- [ ] Data validation works correctly
- [ ] Constraints prevent invalid data
- [ ] Referential integrity is maintained
- [ ] No data corruption occurs

**Issues Found**: _(Document any issues here)_

**Performance Metrics**:
- Average query time: ___ms
- Insert performance: ___ records/second
- Concurrent user capacity: ___ users
- Database size: ___MB

**Security Notes**: _(Record security test results)_

**Additional Notes**: _(Add any additional observations)_
