# Quick Development Reference

## 🚨 MANDATORY CHECKLIST - Before Marking Any Task Complete

### ✅ Testing Requirements
- [ ] **Feature tested** using browser automation/API tools
- [ ] **Happy path** scenarios work correctly
- [ ] **Edge cases** and error scenarios handled
- [ ] **Integration** with existing features verified
- [ ] **No console errors** or warnings
- [ ] **Performance** is acceptable

### ✅ Code Quality Requirements
- [ ] **Simple and readable** implementation
- [ ] **Proper error handling** throughout
- [ ] **Meaningful comments** for major functionality
- [ ] **Follows established patterns** and conventions
- [ ] **Reusable and modular** design
- [ ] **TypeScript types** properly defined

### ✅ Documentation Requirements
- [ ] **Code comments** explain purpose and rationale
- [ ] **README/docs** updated if needed
- [ ] **API documentation** updated for new endpoints
- [ ] **Database schema** documented for new tables

## 🏗️ Architecture Patterns

### Module Structure
```
src/modules/[feature]/
├── components/     # UI components
├── hooks/         # Custom hooks
├── services/      # Business logic & API calls
├── types/         # TypeScript definitions
├── utils/         # Helper functions
└── index.ts       # Exports
```

### Database Conventions
- **Table prefix**: `bm_` (budget manager)
- **RLS enabled**: On all tables
- **Indexes**: For performance-critical queries
- **Foreign keys**: Proper relationships

### Component Patterns
```typescript
// Good: Simple, reusable component
interface ButtonProps {
  variant: 'primary' | 'secondary'
  onClick: () => void
  children: React.ReactNode
}

export function Button({ variant, onClick, children }: ButtonProps) {
  // Implementation with proper error handling
}
```

## 🧪 Testing Approach

### 1. Plan Tests First
- Define what should work
- Identify edge cases
- Plan error scenarios

### 2. Use Available Tools
- Browser automation for UI
- API testing for endpoints
- Database queries for data
- Console monitoring for errors

### 3. Test Thoroughly
- Test all planned scenarios
- Fix any issues immediately
- Re-test after fixes
- Verify integration

## 🚫 Never Deliver
- Untested code
- Code with known bugs
- Code breaking existing features
- Code without error handling
- Code not following patterns

## ✅ Always Deliver
- Thoroughly tested features
- Well-documented code
- Proper error handling
- Clean, readable implementation
- Integration verified

## 📝 Comment Template
```typescript
/**
 * [Brief description of what this does]
 * 
 * [Why this approach was chosen]
 * [Any important assumptions or limitations]
 * 
 * @param param1 - Description
 * @returns Description
 */
```

## 🎯 Quality Gates
1. **Functionality**: Does it work as specified?
2. **Testing**: Are all scenarios tested?
3. **Integration**: Does it work with existing code?
4. **Performance**: Is it fast enough?
5. **Documentation**: Is it properly documented?
6. **Standards**: Does it follow our patterns?

**Remember: Quality is not negotiable. Test everything, document everything, follow patterns.**
