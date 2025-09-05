# 💰 Transaction Processing Testing Checklist

## Prerequisites
- [ ] Authentication, Gmail integration, and sync tests completed
- [ ] Gmail account has transaction emails from various sources
- [ ] At least one successful sync has been performed
- [ ] Sample transaction emails are available for testing

---

## 1. Transaction Extraction - Basic Functionality

### Email Processing
- [ ] Navigate to `/api/transactions/process` (or trigger via UI)
- [ ] Unprocessed Gmail messages are identified
- [ ] Transaction extraction runs successfully
- [ ] Processing completes without errors
- [ ] Results show processed message count

### Transaction Creation
- [ ] New transactions appear in database
- [ ] Each transaction has required fields populated
- [ ] Transaction status is set to "review"
- [ ] Gmail message ID is linked correctly
- [ ] Creation timestamp is accurate

---

## 2. Amount Extraction Testing

### Indian Rupee (INR) Formats
- [ ] ₹1,234.56 format is extracted correctly
- [ ] Rs. 1234 format is extracted correctly
- [ ] INR 1,234.56 format is extracted correctly
- [ ] Amount: Rs. 1234 format is extracted correctly
- [ ] Debited: ₹1,234.56 format is extracted correctly

### International Currency Formats
- [ ] $123.45 format is extracted correctly
- [ ] USD 123.45 format is extracted correctly
- [ ] 123.45 USD format is extracted correctly

### Edge Cases
- [ ] Large amounts (₹1,00,000+) are handled correctly
- [ ] Small amounts (₹1.50) are handled correctly
- [ ] Amounts with no decimal places work
- [ ] Amounts with commas are parsed correctly
- [ ] Invalid amount formats are skipped gracefully

---

## 3. Merchant Extraction Testing

### Common Patterns
- [ ] "Transaction at MERCHANT_NAME" extracts merchant
- [ ] "Payment to MERCHANT_NAME" extracts merchant
- [ ] "Purchase at MERCHANT_NAME" extracts merchant
- [ ] "Merchant: MERCHANT_NAME" extracts merchant

### Merchant Name Cleaning
- [ ] Extra spaces are removed
- [ ] Special characters are handled
- [ ] Capitalization is normalized
- [ ] Very long merchant names are truncated appropriately
- [ ] Empty or invalid merchant names default to "Unknown Merchant"

### Real-World Merchants
- [ ] Amazon transactions are identified correctly
- [ ] Flipkart transactions are identified correctly
- [ ] Swiggy/Zomato transactions are identified correctly
- [ ] Bank/ATM transactions are identified correctly
- [ ] UPI merchant names are extracted correctly

---

## 4. Payment Method Detection

### Credit Card Detection
- [ ] "Credit card ending 1234" is detected
- [ ] "Card ending in 1234" is detected
- [ ] "XXXX1234" pattern is detected
- [ ] "****1234" pattern is detected
- [ ] Last 4 digits are extracted correctly

### Debit Card Detection
- [ ] "Debit card ending 1234" is detected
- [ ] "ATM card ending 1234" is detected
- [ ] Debit card transactions are categorized correctly

### UPI Detection
- [ ] "UPI" keyword triggers UPI detection
- [ ] "Paytm" triggers UPI detection
- [ ] "PhonePe" triggers UPI detection
- [ ] "Google Pay" triggers UPI detection
- [ ] "BHIM" triggers UPI detection

### Net Banking Detection
- [ ] "Net banking" triggers detection
- [ ] "Internet banking" triggers detection
- [ ] "Online banking" triggers detection

---

## 5. Transaction Date Extraction

### Date Format Recognition
- [ ] DD/MM/YYYY format is parsed correctly
- [ ] DD-MM-YYYY format is parsed correctly
- [ ] DD MMM YYYY format is parsed correctly
- [ ] "on DD/MM/YYYY" format is parsed correctly

### Date Validation
- [ ] Invalid dates fall back to email received date
- [ ] Future dates are handled appropriately
- [ ] Very old dates are handled appropriately
- [ ] Date parsing errors don't crash the system

---

## 6. Transaction Type Classification

### Debit Transactions
- [ ] "Debited" keyword triggers debit classification
- [ ] "Purchase" keyword triggers debit classification
- [ ] "Payment" keyword triggers debit classification
- [ ] "Spent" keyword triggers debit classification

### Credit Transactions
- [ ] "Credited" keyword triggers credit classification
- [ ] "Received" keyword triggers credit classification
- [ ] "Refund" keyword triggers credit classification
- [ ] "Cashback" keyword triggers credit classification

### Transfer Transactions
- [ ] "Transfer" keyword triggers transfer classification
- [ ] "Sent" keyword triggers transfer classification
- [ ] "Moved" keyword triggers transfer classification

---

## 7. Confidence Scoring

### High Confidence Transactions
- [ ] Transactions with all fields extracted get high scores (>0.8)
- [ ] Transactions from reliable senders get high scores
- [ ] Well-formatted emails get high scores

### Medium Confidence Transactions
- [ ] Transactions with some missing fields get medium scores (0.6-0.8)
- [ ] Transactions from unknown senders get medium scores

### Low Confidence Transactions
- [ ] Transactions with minimal data get low scores (<0.6)
- [ ] Malformed emails get low scores
- [ ] Ambiguous transactions get low scores

### Confidence Score Accuracy
- [ ] Confidence scores correlate with extraction quality
- [ ] High confidence transactions are generally accurate
- [ ] Low confidence transactions are flagged appropriately

---

## 8. Error Handling & Edge Cases

### Malformed Emails
- [ ] Emails with no amount are skipped gracefully
- [ ] Emails with corrupted content are handled
- [ ] Emails with unusual encoding are processed
- [ ] Empty emails don't crash the system

### Processing Failures
- [ ] Individual email failures don't stop batch processing
- [ ] Failed emails are marked appropriately
- [ ] Error messages are logged for debugging
- [ ] Retry logic works for transient failures

### Data Validation
- [ ] Negative amounts are handled correctly
- [ ] Zero amounts are handled appropriately
- [ ] Extremely large amounts are validated
- [ ] Invalid currency codes are handled

---

## 9. Whitelisted Senders Integration

### Sender Filtering
- [ ] Only emails from whitelisted senders are processed
- [ ] Non-whitelisted senders are skipped
- [ ] Domain-based whitelisting works
- [ ] Email-specific whitelisting works

### Default Whitelisted Senders
- [ ] Major Indian banks are whitelisted by default
- [ ] Payment platforms (Paytm, PhonePe) are whitelisted
- [ ] Credit card companies are whitelisted
- [ ] E-commerce platforms are whitelisted

---

## 10. Transaction Review Interface

### Transaction Display
- [ ] Navigate to `/transactions`
- [ ] Extracted transactions appear in review list
- [ ] All transaction details are displayed correctly
- [ ] Confidence scores are shown visually
- [ ] Transaction cards are well-formatted

### Transaction Details
- [ ] Amount is formatted correctly with currency
- [ ] Merchant name is displayed clearly
- [ ] Payment method information is shown
- [ ] Transaction date is formatted properly
- [ ] Confidence score is indicated (stars/percentage)

---

## 11. Transaction Actions

### Approve Transactions
- [ ] Click "Approve" button on transaction
- [ ] Transaction status changes to "saved"
- [ ] Success message appears
- [ ] Transaction moves to approved list
- [ ] Database is updated correctly

### Reject Transactions
- [ ] Click "Reject" button on transaction
- [ ] Transaction status changes to "ignored"
- [ ] Success message appears
- [ ] Transaction moves to rejected list
- [ ] Database is updated correctly

### Edit Transactions (if implemented)
- [ ] Click "Edit" button opens edit form
- [ ] Can modify transaction details
- [ ] Changes are saved correctly
- [ ] Validation works on edited data

---

## 12. Batch Processing

### Multiple Transactions
- [ ] Multiple emails are processed in one batch
- [ ] Processing order is consistent
- [ ] Batch results are accurate
- [ ] No transactions are lost in batch processing

### Performance
- [ ] Large batches complete in reasonable time
- [ ] Memory usage remains stable during batch processing
- [ ] Progress indication works for large batches
- [ ] System remains responsive during processing

---

## 13. Data Quality Testing

### Extraction Accuracy
- [ ] Test with real bank emails → high accuracy
- [ ] Test with credit card emails → high accuracy
- [ ] Test with UPI emails → high accuracy
- [ ] Test with e-commerce emails → high accuracy

### False Positives
- [ ] Non-transaction emails are not processed
- [ ] Promotional emails are filtered out
- [ ] Newsletter emails are ignored
- [ ] System emails are not processed as transactions

### False Negatives
- [ ] Valid transaction emails are not missed
- [ ] Different email formats are handled
- [ ] Various sender formats work
- [ ] Edge case transactions are caught

---

## 14. Integration Testing

### End-to-End Flow
- [ ] Gmail sync → Transaction processing → Review interface works seamlessly
- [ ] Data flows correctly between all components
- [ ] No data loss in the pipeline
- [ ] Timing and sequencing work correctly

### Database Integration
- [ ] All transaction data is stored correctly
- [ ] Foreign key relationships are maintained
- [ ] Database constraints are respected
- [ ] Data integrity is preserved

---

## ✅ Transaction Processing Testing Summary

**Total Tests**: 100+ individual test cases

**Critical Path Tests** (Must Pass):
- [ ] Basic transaction extraction works
- [ ] Amount extraction is accurate for common formats
- [ ] Merchant extraction works for major patterns
- [ ] Payment method detection works
- [ ] Transaction review interface functions
- [ ] Approve/reject actions work correctly

**Accuracy Tests** (Must Pass):
- [ ] High confidence transactions are accurate (>90%)
- [ ] Common transaction formats are handled correctly
- [ ] Major Indian banks and payment platforms work
- [ ] False positive rate is low (<5%)

**Data Quality Metrics**:
- Extraction accuracy: ___% (target: >90%)
- False positive rate: ___% (target: <5%)
- Processing speed: ___ transactions/second
- Average confidence score: ___

**Issues Found**: _(Document any issues here)_

**Accuracy Notes**: _(Record specific accuracy observations)_

**Additional Notes**: _(Add any additional observations)_
