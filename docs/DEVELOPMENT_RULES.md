# Comprehensive Development Rules for Augment Code

## 🎯 Core Principles

These rules MUST be followed for every feature, bug fix, or code change when using Augment Code.

## 1. 🧪 Mandatory Testing and Quality Assurance

### **Testing Requirements**
- **ALWAYS** thoroughly test every feature before marking it as complete
- **NEVER** deliver untested code to the user
- Use all available MCP tools for comprehensive testing:
  - Browser automation for UI testing
  - API testing for backend endpoints
  - Database queries for data validation
  - Network requests verification
  - Console error monitoring

### **Testing Scope**
- **Happy Path**: Test normal, expected user flows
- **Edge Cases**: Test boundary conditions, empty states, invalid inputs
- **Error Scenarios**: Test error handling and recovery
- **Integration**: Verify new features work with existing code
- **Cross-browser**: Test in different browsers when applicable
- **Responsive**: Test on different screen sizes for UI features

### **Testing Process**
1. **Plan Tests**: Define test scenarios before implementation
2. **Implement Feature**: Write the code
3. **Test Thoroughly**: Execute all planned tests
4. **Fix Issues**: If any problems found, fix immediately
5. **Re-test**: Verify fixes work and don't break other functionality
6. **Document**: Record test results and any known limitations

### **Quality Gates**
- ✅ All tests pass
- ✅ No console errors or warnings
- ✅ Performance is acceptable
- ✅ Code follows established patterns
- ✅ Documentation is updated

## 2. 🏗️ Code Quality and Architecture Standards

### **Simplicity First**
- Keep implementations **simple and straightforward**
- Prefer readable code over clever code
- Use clear, descriptive names for variables, functions, and components
- Avoid unnecessary complexity or over-engineering
- Write code that a junior developer can understand

### **Software Engineering Principles**

#### **Reusability**
- Write components and functions that can be used across multiple contexts
- Extract common functionality into shared utilities
- Create generic, configurable components rather than specific ones
- Use TypeScript interfaces and types for consistency

#### **Modularity**
- Organize code into well-defined, self-contained modules
- Each module should have a clear, single responsibility
- Define clean interfaces between modules
- Minimize dependencies between modules
- Follow the established module structure:
  ```
  src/modules/[feature]/
  ├── components/     # Feature-specific components
  ├── hooks/         # Custom hooks
  ├── services/      # API calls and business logic
  ├── types/         # TypeScript types
  ├── utils/         # Utility functions
  └── index.ts       # Module exports
  ```

#### **Separation of Concerns**
- **UI Components**: Only handle presentation and user interaction
- **Business Logic**: Separate from UI in services or custom hooks
- **Data Access**: Isolate database operations in dedicated services
- **Configuration**: Keep settings and constants in separate files
- **Styling**: Use consistent CSS/Tailwind patterns

#### **DRY Principle (Don't Repeat Yourself)**
- Extract repeated code into functions or components
- Use constants for repeated values
- Create utility functions for common operations
- Share types and interfaces across modules

### **Documentation Standards**

#### **Code Comments**
Add clear, meaningful comments for:
- **Purpose**: What the code does
- **Rationale**: Why it was implemented this way
- **Assumptions**: Important assumptions or limitations
- **Complex Logic**: Explain algorithms or business rules
- **API Contracts**: Document expected inputs/outputs

#### **Comment Examples**
```typescript
/**
 * Calculates the monthly budget allocation based on user income and expenses.
 * 
 * This function implements the 50/30/20 budgeting rule:
 * - 50% for needs (rent, utilities, groceries)
 * - 30% for wants (entertainment, dining out)
 * - 20% for savings and debt repayment
 * 
 * @param income - Monthly after-tax income
 * @param fixedExpenses - Required monthly expenses
 * @returns Budget allocation object with needs, wants, and savings amounts
 */
function calculateBudgetAllocation(income: number, fixedExpenses: number): BudgetAllocation {
  // Ensure income covers fixed expenses before allocation
  if (income <= fixedExpenses) {
    throw new Error('Income must exceed fixed expenses for budget allocation')
  }
  
  // Calculate disposable income after fixed expenses
  const disposableIncome = income - fixedExpenses
  
  // Apply 50/30/20 rule to disposable income
  return {
    needs: fixedExpenses + (disposableIncome * 0.5),
    wants: disposableIncome * 0.3,
    savings: disposableIncome * 0.2
  }
}
```

### **Error Handling Standards**
- **Always** handle potential errors gracefully
- Provide meaningful error messages to users
- Log detailed error information for debugging
- Use try-catch blocks for async operations
- Validate inputs at function boundaries
- Return appropriate HTTP status codes for API endpoints

### **Performance Considerations**
- Optimize database queries (use indexes, limit results)
- Implement proper caching where appropriate
- Minimize API calls and bundle requests when possible
- Use lazy loading for large components or data sets
- Monitor and measure performance impacts

## 3. 🔄 Development Workflow

### **Feature Implementation Process**
1. **Understand Requirements**: Clarify what needs to be built
2. **Plan Architecture**: Design the module structure and interfaces
3. **Implement Core Logic**: Write the main functionality
4. **Add Error Handling**: Implement proper error management
5. **Write Tests**: Create comprehensive test scenarios
6. **Test Thoroughly**: Execute all tests and verify functionality
7. **Fix Issues**: Address any problems found during testing
8. **Document**: Update documentation and add comments
9. **Review**: Ensure code follows all established patterns
10. **Deliver**: Present working, tested feature to user

### **Code Review Checklist**
- [ ] Code is simple and easy to understand
- [ ] Follows established patterns and conventions
- [ ] Has appropriate error handling
- [ ] Includes meaningful comments
- [ ] Is properly tested
- [ ] Integrates well with existing code
- [ ] Performance is acceptable
- [ ] Documentation is updated

## 4. 🚀 Technology-Specific Guidelines

### **Next.js/React**
- Use functional components with hooks
- Implement proper loading and error states
- Follow React best practices for state management
- Use TypeScript for all components and props

### **Database (Supabase)**
- All tables prefixed with `bm_`
- Enable Row Level Security (RLS) on all tables
- Create proper indexes for performance
- Use transactions for multi-table operations

### **API Design**
- RESTful endpoints with proper HTTP methods
- Consistent error response format
- Input validation on all endpoints
- Proper authentication and authorization

## 5. ✅ Delivery Standards

### **Definition of Done**
A feature is only complete when:
- ✅ All functionality works as specified
- ✅ All tests pass
- ✅ No console errors or warnings
- ✅ Code follows quality standards
- ✅ Documentation is updated
- ✅ Integration with existing features verified
- ✅ User can successfully use the feature

### **Never Deliver**
- ❌ Untested code
- ❌ Code with known bugs
- ❌ Code that breaks existing functionality
- ❌ Code without proper error handling
- ❌ Code that doesn't follow established patterns

## 📋 Summary

These rules ensure that every piece of code delivered is:
- **Thoroughly tested** and working
- **Well-architected** and maintainable
- **Properly documented** and understandable
- **Integrated** with existing systems
- **Production-ready** and reliable

**Remember: Quality is not negotiable. Always test, always document, always follow best practices.**
