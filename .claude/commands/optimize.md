# Command: `/optimize`
**Aliases:** `/opt`, `/improve`, `/refactor`
Optimize existing features with automated analysis, implementation, and documentation.

---

## Workflow

### Step 1: Select Target
````
? What do you want to optimize?
  > Feature from previous execution
    Specific file/component
    Performance bottleneck
    Code quality issue
    [Enter custom path...]
````

If selecting from previous execution:
````
? Select from recent executions:
  > 2026_01_08_1430__BOOKING_FLOW.md
    2026_01_08_1200__AUTH_SYSTEM.md
    2026_01_07_0900__PAYMENT_INTEGRATION.md
````

### Step 2: Analyze Current State
- Scan target files and dependencies
- Identify optimization opportunities
- Categorize by impact level
````
? Analysis complete. Found optimization opportunities:

  🔴 High Impact (Architectural)
     - Database query restructuring
     - State management refactor
  
  🟡 Medium Impact (Structural)
     - Component decomposition
     - API response optimization
  
  🟢 Low Impact (Polish)
     - Code cleanup
     - Performance micro-optimizations

  Select scope: [All] [High only] [Custom selection]
````

### Step 3: Classify Change Scope
Automatically determine documentation requirements:

| Change Scope | Criteria | Documentation |
|--------------|----------|---------------|
| **Architectural** | New patterns, dependencies, structural redesign | → Create ADR |
| **Incremental** | Bug fixes, improvements, refactors | → Create AGENTS_LOG |
| **Continuation** | Same feature, same day, minor tweaks | → Append to existing log |

### Step 4: Execute Optimization
- Apply optimizations sequentially
- Run tests after each significant change
- Track before/after metrics where applicable

### Step 5: Code Review
- Trigger `/review` on changed files
- Validate optimizations don't introduce regressions
- Check performance benchmarks if applicable

### Step 6: Generate Documentation
Based on Step 3 classification:
- **Architectural changes** → `docs/ADR/ADR-NNN-*.md`
- **New changelog needed** → `docs/AGENTS_LOG/YYYY_MM_DD_HHmm__*.md`
- **Same-day continuation** → Append to existing log

---

## Change Scope Detection

### Architectural Changes (→ ADR)
Triggers ADR creation when optimization involves:
````
✓ Introducing new design patterns
✓ Adding/replacing major dependencies
✓ Changing data flow architecture
✓ Restructuring database schema
✓ Modifying authentication/authorization flow
✓ Changing API contract structure
✓ Introducing new infrastructure components
✓ Fundamental performance architecture changes
✓ Changing state management approach
✓ Modifying build/deployment pipeline
````

### Incremental Changes (→ New AGENTS_LOG)
Creates new changelog when:
````
✓ Different date from last related changelog
✓ Significant improvements to existing features
✓ Bug fixes with notable code changes
✓ Refactoring without architectural impact
✓ Performance optimizations within existing patterns
✓ UI/UX improvements
✓ Code quality improvements
✓ Test coverage additions
````

### Continuation (→ Append to existing log)
Appends to existing changelog when:
````
✓ Same calendar day as previous log
✓ Same feature context
✓ Minor tweaks or follow-ups
✓ Quick fixes from review feedback
````

---

## Optimization Log Template
````markdown
# [FEATURE_NAME] - Optimization Log

**Date:** YYYY-MM-DD HH:mm
**Type:** Performance | Refactor | Quality | Security | UX
**Target:** [Original plan/execution reference]
**Executed By:** Claude Agent
**Related ADR:** [ADR-NNN or "None"]

---

## Optimization Summary

[Brief description of what was optimized and why]

### Trigger
- [ ] Performance issue identified
- [ ] Code review feedback
- [ ] Technical debt reduction
- [ ] User feedback
- [ ] Proactive improvement

---

## Before State

### Metrics (if applicable)
| Metric | Value |
|--------|-------|
| Load time | X ms |
| Bundle size | X KB |
| Lighthouse score | X |
| Test coverage | X% |

### Issues Identified
1. [Issue 1 - description]
2. [Issue 2 - description]
3. [Issue 3 - description]

### Code Sample (Before)
```tsx
// Previous implementation
```

---

## Optimizations Applied

### 1. [Optimization Title]
**Impact:** High | Medium | Low
**Category:** Performance | Readability | Maintainability | Security

**Changes:**
- [Specific change 1]
- [Specific change 2]

**Files Modified:**
| File | Change |
|------|--------|
| `src/file.ts` | [Description] |

### 2. [Optimization Title]
**Impact:** High | Medium | Low
**Category:** Performance | Readability | Maintainability | Security

**Changes:**
- [Specific change 1]
- [Specific change 2]

---

## After State

### Metrics (if applicable)
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Load time | X ms | Y ms | -Z% |
| Bundle size | X KB | Y KB | -Z% |
| Lighthouse score | X | Y | +Z |
| Test coverage | X% | Y% | +Z% |

### Code Sample (After)
```tsx
// Optimized implementation
```

---

## Changes Made

| File | Action | Description |
|------|--------|-------------|
| `src/file.ts` | Modified | Optimized query logic |
| `src/utils.ts` | Modified | Added memoization |

---

## Testing

| Test Type | Status | Notes |
|-----------|--------|-------|
| Unit | ✅ Pass | All existing + 3 new |
| Integration | ✅ Pass | No regressions |
| Performance | ✅ Pass | Meets targets |
| Manual | ✅ Pass | Verified improvements |

---

## Rollback Plan

If issues arise:
```bash
# Commands or steps to rollback
git revert <commit-hash>
```

**Rollback considerations:**
- [Any data migration concerns]
- [Cache invalidation needs]

---

## Follow-up

- [ ] Monitor performance in production
- [ ] Gather user feedback
- [ ] Consider further optimizations: [details]

---

## Sign-off Checklist

- [ ] Optimizations tested
- [ ] No regressions introduced
- [ ] Performance targets met
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] ADR created (if architectural)
````

---

## ADR Template for Optimization

When optimization requires architectural changes:
````markdown
# ADR-NNN: [Optimization Decision Title]

**Status:** Accepted
**Date:** YYYY-MM-DD
**Decision Makers:** Project Team
**Optimization Context:** [Link to original feature/execution log]

---

## Context

[Describe the optimization need - performance issue, scalability concern, maintainability problem]

### Current State
- [How things work currently]
- [Pain points or limitations]
- [Metrics showing the problem]

### Optimization Goals
- [Goal 1 with target metric]
- [Goal 2 with target metric]

---

## Decision

**[Clear statement of the architectural change made for optimization]**

### Implementation

[Detailed implementation approach]
```ts
// Code examples showing the new approach
```

**Changes from Previous Architecture:**
| Aspect | Before | After |
|--------|--------|-------|
| [Aspect 1] | [Old approach] | [New approach] |
| [Aspect 2] | [Old approach] | [New approach] |

---

## Rationale

### Why This Approach
1. [Reason 1 with supporting data]
2. [Reason 2 with supporting data]

### Alternatives Considered
1. **[Alternative 1]** - Why rejected
2. **[Alternative 2]** - Why rejected

### Pros
1. [Benefit 1]
2. [Benefit 2]

### Cons
1. [Trade-off 1] - Mitigation strategy
2. [Trade-off 2] - Mitigation strategy

---

## Consequences

### Must Do
- [Required practice going forward]
- [Migration steps for existing code]

### Must Not Do
- [Anti-patterns to avoid]
- [Old patterns to deprecate]

### Migration Path
```tsx
// Before: Old pattern (deprecate)
<old approach>

// After: New pattern (adopt)
<new approach>
```

---

## Validation

### Success Metrics
| Metric | Target | Achieved |
|--------|--------|----------|
| [Metric 1] | [Target] | [Result] |
| [Metric 2] | [Target] | [Result] |

---

## References

- [Original feature ADR if exists]
- [Performance analysis docs]
- [Benchmark results]
````

---

## Usage Examples
````bash
# Interactive mode
/optimize

# Optimize specific feature
/optimize feature:booking-flow

# Optimize from recent execution
/optimize --from-log 2026_01_08_1430__BOOKING_FLOW.md

# Specific optimization type
/optimize --type=performance src/components/BookingCard.tsx
/optimize --type=refactor src/lib/api/

# With options
/optimize --dry-run feature:auth
/optimize --skip-review --type=quality
/optimize --force-adr feature:payment  # Force ADR creation
/optimize --append-log feature:booking  # Force append to existing log
````

---

## Options

| Flag | Description |
|------|-------------|
| `--dry-run` | Preview optimizations without applying |
| `--skip-review` | Skip the code review step |
| `--verbose` | Show detailed optimization analysis |
| `--type <type>` | Filter optimization type: `performance`, `refactor`, `quality`, `security`, `ux` |
| `--from-log <file>` | Start from specific execution log |
| `--force-adr` | Force ADR creation regardless of scope |
| `--append-log` | Force append to most recent related log |
| `--metrics` | Run before/after performance metrics |
| `--benchmark` | Run performance benchmarks |

---

## Optimization Types

| Type | Focus | Examples |
|------|-------|----------|
| `performance` | Speed, efficiency | Query optimization, lazy loading, caching |
| `refactor` | Code structure | Component decomposition, DRY improvements |
| `quality` | Code standards | TypeScript strictness, linting, testing |
| `security` | Vulnerabilities | Input validation, auth hardening |
| `ux` | User experience | Loading states, error handling, accessibility |

---

## Error Handling

1. **Target not found:** Prompt to select from available features/files
2. **No optimizations identified:** Report clean state, suggest manual review
3. **Optimization failure:** Log error, offer rollback, continue with remaining
4. **Test regression:** Block completion, show diff, require resolution
5. **Metrics degradation:** Warn and confirm before proceeding

---

## Directory Structure
````
docs/
├── plans/                    # Planning files
│   └── ...
├── ADR/                      # Architecture Decision Records
│   ├── README.md
│   ├── ADR-001-bootstrap-styling.md
│   ├── ADR-002-mongodb-selection.md
│   └── ADR-015-query-optimization.md    # ← From optimization
└── AGENTS_LOG/               # Execution & Optimization logs
    ├── 2026_01_05_1430__AUTH_FLOW.md           # Original execution
    ├── 2026_01_08_0900__AUTH_FLOW_OPT.md       # ← Optimization log
    ├── 2026_01_06_1600__BOOKING_UI.md          # Original execution
    └── 2026_01_08_1400__BOOKING_UI_OPT.md      # ← Optimization log
````

---

## Naming Conventions

### Optimization Logs
````
YYYY_MM_DD_HHmm__FEATURE_NAME_OPT.md
````

**Examples:**
- `2026_01_08_0900__AUTH_FLOW_OPT.md`
- `2026_01_08_1400__BOOKING_UI_OPT.md`
- `2026_01_09_1030__PAYMENT_PERF_OPT.md`

### Optimization ADRs
````
ADR-NNN-optimization-context.md
````

**Examples:**
- `ADR-015-query-caching-strategy.md`
- `ADR-016-component-lazy-loading.md`
- `ADR-017-state-management-refactor.md`

---

## Integration with /exec

The `/optimize` command is designed to work seamlessly after `/exec`:
````
/exec docs/plans/feature-booking.md
  ↓
[Feature implemented]
  ↓
[Time passes, issues identified]
  ↓
/optimize --from-log 2026_01_05_1430__BOOKING_FLOW.md
  ↓
[Optimizations applied]
  ↓
[ADR created if architectural]
[AGENTS_LOG created/appended]
````

---

## Decision Flow Chart
````
┌─────────────────────────────────┐
│     /optimize triggered         │
└──────────────┬──────────────────┘
               ▼
┌─────────────────────────────────┐
│   Analyze changes scope         │
└──────────────┬──────────────────┘
               ▼
       ┌───────┴───────┐
       ▼               ▼
┌─────────────┐  ┌─────────────┐
│ Architectural│  │ Incremental │
│   Change?   │  │   Change?   │
└──────┬──────┘  └──────┬──────┘
       │                │
       ▼                ▼
┌─────────────┐  ┌─────────────────┐
│ Create ADR  │  │ Same day as     │
│ docs/ADR/   │  │ previous log?   │
└──────┬──────┘  └────────┬────────┘
       │           ┌──────┴──────┐
       │           ▼             ▼
       │    ┌──────────┐  ┌──────────┐
       │    │  Yes     │  │   No     │
       │    └────┬─────┘  └────┬─────┘
       │         ▼             ▼
       │    ┌──────────┐  ┌──────────────┐
       │    │ Append   │  │ Create new   │
       │    │ existing │  │ AGENTS_LOG   │
       │    └──────────┘  └──────────────┘
       │         │             │
       └─────────┴──────┬──────┘
                        ▼
              ┌─────────────────┐
              │   Complete      │
              └─────────────────┘
````
