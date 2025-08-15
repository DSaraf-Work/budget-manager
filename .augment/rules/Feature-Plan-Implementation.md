---
type: "agent_requested"
description: "4-Phase structured workflow for comprehensive project planning and implementation. Proactively use when user requests structured planning, building features, or systematic development approach."
---
# Planning Agent Workflow Rules

## Rule Category: `planning_agent_workflow`
**When to use**: When user requests to create a plan, develop a feature, build something new, or asks for structured project planning and implementation.

**Keywords that trigger this rule**: "create a plan", "build", "develop", "implement", "requirements", "feature planning", "project planning", "structured development", "systematic approach"

## Overview
- **Agent Type**: Structured Planning Agent  
- **Version**: 2.0.0  
- **Workflow**: 4-Phase structured approach for comprehensive project planning and implementation
- **File Organization**: All planning files created in `dev/{feature-name}/` at root level

## Core Behavioral Rules

### 🚫 Critical Prohibitions
- **Never skip any phase** - All 4 phases (A, B, C, D) must be completed sequentially
- **Never proceed without explicit user confirmation** - Wait for approval between phases
- **Never assume requirements** - Always ask detailed clarifying questions
- **Never expand scope** - Stick to user requirements, put expansions in Future Scope
- **Never introduce breaking changes** - Ensure existing functionalities remain unaffected
- **Never bypass dev/{feature-name}/ staging** - All files created there first

### ✅ Mandatory Actions
- **Always create files in `dev/{feature-name}/`** folder at root level
- **Always wait for user confirmation** between phase transitions
- **Always allow iterative editing** - user can edit files directly or via chat
- **Always keep changes minimal** unless explicitly asked for complexity
- **Always check for edge cases and breaking changes**
- **Always update readmes/ folder** during implementation

---

## 4-Phase Workflow

### Phase A: Requirements (Merged Requirements Gathering + Review + Validation)
**Trigger**: User asks to create/plan/build something
**Objective**: Collect, refine, and finalize all requirements through iterative process

#### File Structure Created:
```
dev/{feature-name}/
└── requirements.md
```

#### Process:
1. **Ask detailed questions** about the project
2. **Create requirements.md** in `dev/{feature-name}/` 
3. **Include clarification questions** if any ambiguities exist
4. **Allow user to edit** requirements.md directly or provide chat feedback
5. **Update document** based on feedback
6. **Repeat iteratively** until user expresses complete satisfaction. if user mentioned that he edited file or added comments, look up the comments and update the entire requirements file again
7. **Document only user's explicit ask** - no scope expansion
8. **Create Future Scope section** for potential enhancements

#### Key Questions to Ask:
- What type of application/system do you want?
- What are the core features you need?
- Who are the target users?
- Any technology preferences or constraints?
- Timeline and resource constraints?
- Integration requirements with existing systems?
- Success criteria and measurable outcomes?
- Edge cases and priority levels?

#### User Confirmation Required:
*"Please review requirements.md in dev/{feature-name}/. You can edit it directly or tell me changes in chat. This continues until you're completely satisfied. Confirm when ready for Phase B."*

---

### Phase B: Technical Design Document Creation
**Objective**: Create comprehensive technical design with minimal complexity approach

#### File Structure Created:
```
dev/{feature-name}/
├── requirements.md (from Phase A)
├── workflow-diagram.mermaid
├── hld.md (High Level Design)
├── lld.md (Low Level Design)  
├── implementation-breakdown.md
└── future-scope.md
```

#### Process:
1. **Analyze requirements** while keeping changes minimal
2. **Create Mermaid workflow diagram** showing system flow
3. **Create HLD** - high-level architecture and approach
4. **Create LLD** - detailed technical specifications
5. **Create implementation breakdown** - stage-by-stage plan
6. **Create future scope** document for enhancements
7. **Ensure no breaking changes** to existing functionality
8. **Work iteratively** with user to refine design
9. **Identify reusable components** and existing code to leverage

#### Design Principles:
- **Minimal Complexity**: Keep implementation as simple as possible
- **No Scope Expansion**: Stick strictly to user requirements  
- **No Breaking Changes**: Preserve all existing functionality
- **Edge Case Coverage**: Plan for potential edge cases
- **Component Reuse**: Leverage existing components where possible

#### User Confirmation Required:
*"Technical design documents ready in dev/{feature-name}/. Review workflow diagram, HLD, LLD, implementation breakdown, and future scope. Edit directly or provide feedback. Confirm when approved for Phase C."*
User will edit directly in the files and update on chat. please process user input and update the files for this phase correspondingly. Continue this until user explicitly asks to move to Phase C. Before moving to phase c update workflow diagram, HLD, LLD, implementation breakdown, and future scope with the user feedback.

---

### Phase C: Stages Breakdown & Detailed Planning
**Objective**: Create detailed documentation for each implementation stage

#### File Structure Created:
```
dev/{feature-name}/
├── [all files from Phase B]
├── stages/
│   ├── stage-1-[name].md
│   ├── stage-2-[name].md
│   ├── stage-3-[name].md
│   └── [additional stages]
└── stages-overview.md
```

#### Process:
1. **Break implementation into stages** based on implementation-breakdown.md
2. **Create separate file for each stage** with detailed documentation
3. **Specify files to create/modify** for each stage
4. **Identify README updates needed** for each stage
5. **Plan component reuse** and abstraction for each stage
6. **Work iteratively** with user to finalize breakdown
7. **Ensure incremental value** - each stage adds working functionality

#### Stage Documentation Includes:
- **Objective**: What the stage achieves
- **Deliverables**: Specific working functionality
- **Implementation Details**: Files to create/modify
- **Component Strategy**: Reuse existing, create new reusable components
- **Testing Approach**: Unit, integration, manual testing
- **Dependencies**: Prerequisites and external dependencies
- **Risk Assessment**: Potential issues and mitigation
- **Expected Outcome**: What user will see/experience

#### User Confirmation Required:
*"Detailed stage breakdown ready in dev/{feature-name}/stages/. Review each stage document and overview. Edit directly or provide feedback. Confirm when finalized for Phase D implementation."*

---

### Phase D: Implementation Execution
**Objective**: Execute implementation stage by stage, updating progress in real-time

#### Process:
1. **Implement stages sequentially** as documented
2. **Update stage files** with progress and completion status
3. **Add detailed comments** about implementation decisions
4. **Mark completed tasks** with checkmarks in stage documents
5. **Update README files** as specified for each stage
6. **Test functionality** after each stage completion
7. **Get user confirmation** before proceeding to next stage
8. **Document deviations** and implementation decisions

#### Real-time Updates in Stage Files:
```markdown
## Implementation Status
- [x] Planning complete
- [x] Implementation started  
- [x] Core functionality complete
- [ ] Testing in progress
- [ ] README updates pending
- [ ] Stage review pending

## Implementation Notes
- Created ComponentX with reusable design
- Modified ExistingComponent to support new feature
- Abstracted common logic into UtilityModule
- Issue encountered: [description] - Resolution: [solution]

## Files Created/Modified
- src/components/NewComponent.js - [description]
- src/utils/CommonLogic.js - [abstracted logic]
- readmes/api-documentation.md - [updated sections]

## User Confirmation Required
Ready to proceed to Stage [X+1]? [Yes/No]
```

#### Stage Completion Pattern:
*"Stage [X] implementation completed. Updated dev/{feature-name}/stages/stage-[X]-[name].md with progress, implementation notes, and completion status. Please review implemented functionality. Confirm to proceed to Stage [X+1] or provide feedback."*

---

## File Organization & Templates

### Required File Structure:
```
root/
├── readmes/                    # Current codebase docs (UPDATE during Phase D)
├── dev/                       # Planning staging area  
│   └── {feature-name}/        # All planning files here
│       ├── requirements.md    # Phase A
│       ├── workflow-diagram.mermaid  # Phase B
│       ├── hld.md            # Phase B
│       ├── lld.md            # Phase B  
│       ├── implementation-breakdown.md  # Phase B
│       ├── future-scope.md   # Phase B
│       ├── stages-overview.md # Phase C
│       └── stages/           # Phase C
│           ├── stage-1-[name].md
│           ├── stage-2-[name].md
│           └── [more stages]
└── [implementation files]     # Created during Phase D
```

---

## Implementation Guidelines

### Code Quality Principles:
- **Minimal Changes**: Keep modifications as simple as possible
- **Component Reuse**: Always check for existing reusable components first
- **Logic Abstraction**: Extract complex/common logic into reusable modules
- **No Breaking Changes**: Ensure backward compatibility
- **Edge Case Handling**: Plan for and test edge cases
- **Incremental Development**: Each stage adds working functionality
- **Modular Architecture**: Maintain clean, modular design

### User Interaction Patterns:
- **Iterative Refinement**: Allow continuous editing and feedback
- **Explicit Confirmation**: Wait for clear approval between phases
- **Direct Editing**: Support both file editing and chat feedback
- **Progress Transparency**: Show real-time implementation progress
- **Flexible Adaptation**: Adapt to user feedback and changes

---

## When Agent Should Use This Rule

### Primary Triggers:
- User says "create a plan for [something]"
- User asks to "build", "develop", or "implement" a feature
- User requests "structured approach" to development
- User asks for "systematic planning" of a project
- User wants to "add a feature" with proper planning

### Context Indicators:
- Request involves creating something new
- User wants methodical, step-by-step approach  
- Project has complexity requiring planning phases
- User values documentation and structured process
- Need to ensure no breaking changes to existing system

### Example User Requests:
- "Create a plan for a todo app"
- "I want to build a user authentication system"
- "Help me plan the development of a dashboard feature"
- "I need a structured approach to implement search functionality"
- "Can you create a comprehensive plan for adding payment integration?"

### Rule Selection Priority:
Use this rule when user explicitly requests planning OR when the request is complex enough to benefit from structured approach. For simple, single-file changes, other rules may be more appropriate.