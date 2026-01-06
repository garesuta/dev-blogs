# Command: `/exec`

**Aliases:** `/run`, `/do`

Execute a planning file with automated review and documentation.

---

## Workflow

### Step 1: Select Planning File

```
? Which planning file do you want to execute?
  > docs/plans/feature-auth.md
    docs/plans/feature-booking.md
    docs/plans/bugfix-payment.md
    [Enter custom path...]
```

### Step 2: Execute Plan

- Parse the selected planning file
- Execute tasks sequentially as defined
- Track completed vs pending items
- Handle errors with rollback options

### Step 3: Code Review

- Automatically trigger `/review` on all changed files
- Capture review findings
- Address critical issues before proceeding

### Step 4: Document Changes

Generate changelog at:

```
docs/AGENTS_LOG/YYYY_MM_DD_HHmm__FEATURE_NAME.md
```

---

## Changelog Template

```markdown
# [FEATURE_NAME] - Execution Log

**Date:** YYYY-MM-DD HH:mm
**Plan File:** [path/to/plan.md]
**Executed By:** Claude Agent

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
- [ ] No console errors
- [ ] Responsive design verified
- [ ] Accessibility checked
```

---

## Usage Examples

```bash
# Interactive mode
/exec

# Direct execution
/exec docs/plans/feature-auth.md

# With options
/exec --skip-review docs/plans/hotfix.md
/exec --dry-run docs/plans/feature-booking.md
```

---

## Options

| Flag            | Description                              |
|-----------------|------------------------------------------|
| `--dry-run`     | Preview execution without making changes |
| `--skip-review` | Skip the code review step                |
| `--verbose`     | Show detailed execution logs             |
| `--continue`    | Resume from last checkpoint              |

---

## Error Handling

1. **Plan not found:** Prompt to select from available plans
2. **Execution failure:** Log error, offer rollback or continue
3. **Review failures:** Block completion until resolved (unless `--skip-review`)

---

## Directory Structure

```
docs/
├── plans/                    # Planning files
│   ├── feature-*.md
│   └── bugfix-*.md
└── AGENTS_LOG/              # Execution logs
    ├── 2025_01_05_1430__AUTH_FLOW.md
    └── 2025_01_05_1600__BOOKING_UI.md
```
