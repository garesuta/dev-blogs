# Command: `/exec`
**Aliases:** `/run`, `/do`
Execute a planning file with automated review, documentation, and architectural decision tracking.

---

## Workflow

### Step 1: Select Planning File
````
? Which planning file do you want to execute?
  > docs/plans/feature-auth.md
    docs/plans/feature-booking.md
    docs/plans/bugfix-payment.md
    [Enter custom path...]
````

### Step 2: Execute Plan
- Parse the selected planning file
- Execute tasks sequentially as defined
- Track completed vs pending items
- Handle errors with rollback options

### Step 3: Code Review
- Automatically trigger `/review` on all changed files
- Capture review findings
- Address critical issues before proceeding

### Step 4: Architecture Decision Record (ADR)
When significant technical decisions are made during execution:
- Detect architectural changes (new patterns, dependencies, structural changes)
- Prompt for ADR creation if applicable
- Generate ADR at: `docs/ADR/ADR-NNN-short-title.md`
````
? Architectural decisions detected. Create ADR?
  > Yes - Document decisions
    No - Skip ADR
    Review changes first
````

### Step 5: Document Changes
Generate changelog at:
````
docs/AGENTS_LOG/YYYY_MM_DD_HHmm__FEATURE_NAME.md
````

---

## ADR Template
````markdown
# ADR-NNN: [Decision Title]

**Status:** Proposed | Accepted | Deprecated | Superseded
**Date:** YYYY-MM-DD
**Decision Makers:** [Project Team / Claude Agent / Specific names]

---

## Context

[Describe the situation and why a decision is needed. What problem are we solving?]

Options considered:
1. **Option A** - Brief description
2. **Option B** - Brief description
3. **Option C** - Brief description

---

## Decision

**[Clear statement of the decision made.]**

### Implementation

[How the decision is implemented - specific details, configurations, patterns]
```ts
// Code examples showing implementation
```

**Packages/Dependencies:** (if applicable)
- `package-name` - Purpose

---

## Rationale

### Pros
1. **Benefit 1** - Explanation
2. **Benefit 2** - Explanation
3. **Benefit 3** - Explanation

### Cons
1. **Trade-off 1** - Explanation and mitigation
2. **Trade-off 2** - Explanation and mitigation

---

## Consequences

### Must Do
- [Required practice 1]
- [Required practice 2]
- [Required practice 3]

### Must Not Do
- [Anti-pattern 1]
- [Anti-pattern 2]
- [Anti-pattern 3]

### Guidelines
```tsx
// Good: Following this ADR
<example of correct usage>

// Bad: Violating this ADR
<example of incorrect usage>
```

---

## Future Considerations

1. **[Topic]** - [Potential future enhancement or migration path]
2. **[Topic]** - [Potential future enhancement or migration path]

---

## References

- [Link to relevant documentation]
- [Link to related resources]
- [Link to external guides]
````

---

## ADR Triggers

Create an ADR when execution involves:

| Trigger | Example |
|---------|---------|
| Styling/Framework choice | Bootstrap, Tailwind, CSS-in-JS |
| New dependency added | npm package, external service |
| Pattern introduction | State management, data fetching |
| Database decision | Schema design, indexing strategy |
| API design | REST vs GraphQL, versioning |
| Auth implementation | JWT, OAuth, session strategy |
| Infrastructure | Caching, CDN, deployment |
| Third-party integration | Payment, maps, analytics |
| Performance strategy | Lazy loading, code splitting |
| i18n/RTL approach | Translation system, layout handling |

---

## Changelog Template
````markdown
# [FEATURE_NAME] - Execution Log

**Date:** YYYY-MM-DD HH:mm
**Plan File:** [path/to/plan.md]
**Executed By:** Claude Agent
**ADR Created:** [ADR-NNN or "None"]

---

## Summary
[Brief description of what was accomplished]

## Objectives
- [ ] Objective 1
- [ ] Objective 2
- [ ] Objective 3

## Docs Reviewed
- `path/to/doc1.md`
- `path/to/doc2.md`

## Changes Made

| File | Action | Description |
|------|--------|-------------|
| `src/file.ts` | Modified | Updated validation logic |
| `src/new.ts` | Created | New utility module |

## Technical Notes
[Implementation details, architectural decisions, gotchas]

## Architecture Decisions
| ADR | Title | Status |
|-----|-------|--------|
| [ADR-012](../ADR/ADR-012-payment-gateway.md) | Payment Gateway Selection | Accepted |

## Documentation Updates
- Updated README.md
- Added API docs for new endpoints

## Testing Summary

| Test Type | Status | Notes |
|-----------|--------|-------|
| Unit | ✅ Pass | 12/12 tests |
| Integration | ✅ Pass | 5/5 tests |
| Manual | ✅ Pass | Verified in browser |

## Deployment Notes
[Any deployment requirements, env vars, migrations]

## Impact
- **Performance:** [Any performance implications]
- **Security:** [Security considerations]
- **Breaking Changes:** [Yes/No - details if yes]

## Future Work
- [ ] Follow-up task 1
- [ ] Follow-up task 2

## Sign-off Checklist
- [ ] Code reviewed
- [ ] Tests passing
- [ ] Documentation updated
- [ ] ADR documented (if applicable)
- [ ] No console errors
- [ ] Responsive design verified
- [ ] Accessibility checked
````

---

## Usage Examples
````bash
# Interactive mode
/exec

# Direct execution
/exec docs/plans/feature-auth.md

# With options
/exec --skip-review docs/plans/hotfix.md
/exec --dry-run docs/plans/feature-booking.md
/exec --no-adr docs/plans/minor-fix.md
````

---

## Options

| Flag | Description |
|------|-------------|
| `--dry-run` | Preview execution without making changes |
| `--skip-review` | Skip the code review step |
| `--verbose` | Show detailed execution logs |
| `--continue` | Resume from last checkpoint |
| `--no-adr` | Skip ADR creation prompt |
| `--adr-status <status>` | Set ADR status (proposed/accepted) |

---

## Error Handling

1. **Plan not found:** Prompt to select from available plans
2. **Execution failure:** Log error, offer rollback or continue
3. **Review failures:** Block completion until resolved (unless `--skip-review`)
4. **ADR numbering conflict:** Auto-increment to next available number

---

## Directory Structure
````
docs/
├── plans/                    # Planning files
│   ├── feature-*.md
│   └── bugfix-*.md
├── ADR/                      # Architecture Decision Records
│   ├── README.md             # ADR index
│   ├── ADR-001-bootstrap-styling.md
│   ├── ADR-002-database-selection.md
│   └── ADR-003-auth-strategy.md
└── AGENTS_LOG/               # Execution logs
    ├── 2025_01_05_1430__AUTH_FLOW.md
    └── 2025_01_05_1600__BOOKING_UI.md
````

---

## ADR Index (docs/ADR/README.md)
````markdown
# Architecture Decision Records

This directory contains ADRs documenting significant technical decisions.

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](ADR-001-bootstrap-styling.md) | Bootstrap-First Styling | Accepted | 2026-01-06 |
| [ADR-002](ADR-002-mongodb-selection.md) | MongoDB Database | Accepted | 2026-01-07 |
| [ADR-003](ADR-003-jwt-auth.md) | JWT Authentication | Accepted | 2026-01-08 |

## Statuses

- **Proposed** - Under discussion
- **Accepted** - Approved and implemented
- **Deprecated** - No longer valid
- **Superseded** - Replaced by another ADR

## Creating New ADRs

ADRs are auto-generated by `/exec` when architectural decisions are detected.
For manual creation, use the next available number: `ADR-NNN-short-title.md`
````

---

## ADR Naming Convention
````
ADR-NNN-short-kebab-case-title.md
````

**Examples:**
- `ADR-001-bootstrap-styling.md`
- `ADR-015-stripe-integration.md`
- `ADR-023-rtl-layout-strategy.md`
