# Execute Plan Command

Execute a development plan using TDD workflow, comprehensive testing, and code review verification.

## Usage

```
/execute-plan <plan-path>
```

**Example:**
```
/execute-plan docs/plan/2026/01/2026-01-16-1309-tv-dashboard-system.md
```

## Arguments

- `$ARGUMENTS` - Path to the plan markdown file (e.g., `docs/plan/2026/01/2026-01-16-1309-tv-dashboard-system.md`)

## Workflow

This command orchestrates a complete development workflow using three skills:

1. **Plan-to-TDD** → Implement using test-driven development
2. **Testing-Automation-Expert** → Create comprehensive test coverage
3. **Code-Reviewer** → Verify implementation quality and compliance
4. **Documentation** → Generate execution log and summary

---

## Instructions

### Phase 1: Plan Analysis

Read and analyze the plan at `$ARGUMENTS`:

1. **Extract plan metadata:**
    - Plan ID and title
    - Feature scope and objectives
    - Priority and dependencies
    - Acceptance criteria

2. **Identify implementation units:**
    - Components to create/modify
    - Tests required
    - Integration points

3. **Create execution checklist** from the plan requirements

### Phase 2: Execute Plan-to-TDD Skill

Reference and follow the skill at `.claude/skills/plan-to-tdd`:

```bash
cat .claude/skills/plan-to-tdd/SKILL.md
```

For each implementation unit from the plan:

1. **Write failing test first** (Red phase)
    - Create test file if not exists
    - Write test cases covering acceptance criteria
    - Verify test fails with expected error

2. **Implement minimum code** (Green phase)
    - Write just enough code to pass the test
    - Follow project conventions and patterns
    - Keep implementation focused

3. **Refactor** (Refactor phase)
    - Improve code quality without changing behavior
    - Apply DRY, SOLID principles
    - Optimize for readability

4. **Commit checkpoint** (if using git)
    - Stage related changes
    - Write descriptive commit message

### Phase 3: Testing Automation Expert

Reference and follow the skill at `.claude/skills/testing-automation-expert`:

```bash
cat .claude/skills/testing-automation-expert/SKILL.md
```

Create comprehensive test coverage:

1. **Unit Tests:**
    - Test all public functions and methods
    - Test component rendering and behavior
    - Mock external dependencies
    - Cover edge cases (null, undefined, empty, boundary values)
    - Test error handling paths

2. **Integration Tests:**
    - Test component compositions
    - Test API request/response cycles
    - Test data transformations
    - Test state management flows

3. **E2E Tests (if applicable):**
    - Test critical user journeys
    - Test form validations and submissions
    - Test navigation and routing
    - Test authentication flows

4. **Test Quality Assurance:**
    - Ensure test descriptions are clear
    - Verify tests are deterministic (no flaky tests)
    - Check tests run in isolation
    - Validate coverage meets thresholds

5. **Run Coverage Report:**
   ```bash
   npm run test:coverage
   ```

### Phase 4: Code Review Verification

Reference and follow the skill at `.claude/skills/code-reviewer`:

```bash
cat .claude/skills/code-reviewer/SKILL.md
```

Perform comprehensive code review:

1. **Code Quality Check:**
    - TypeScript/ESLint compliance
    - Naming conventions
    - Code organization
    - Error handling

2. **Test Coverage Review:**
    - All acceptance criteria have tests
    - Edge cases covered
    - Test quality and maintainability

3. **Architecture Compliance:**
    - Follows project structure
    - Proper separation of concerns
    - RTL/LTR support (if UI)
    - Internationalization compliance

4. **Security Review:**
    - Input validation
    - Authentication/authorization
    - Data sanitization

5. **Generate Review Report:**
    - Issues found (critical/warning/info)
    - Recommendations
    - Approval status

### Phase 5: Documentation & Logging

Create execution log at `docs/AGENTS_LOG/`:

```markdown
# Execution Log: [Plan Title]

**Plan:** $ARGUMENTS
**Executed:** [timestamp]
**Status:** [completed/partial/failed]

## Skills Applied
1. ✅ plan-to-tdd - TDD implementation
2. ✅ testing-automation-expert - Comprehensive tests
3. ✅ code-reviewer - Quality verification

## Implementation Summary
- Components created/modified: [list]
- Tests added: [count]
- Files changed: [count]

## TDD Cycles
| Unit | Red | Green | Refactor | Status |
|------|-----|-------|----------|--------|
| ...  | ✓   | ✓     | ✓        | ✓      |

## Test Coverage
| Metric | Coverage | Target |
|--------|----------|--------|
| Statements | [%] | 80% |
| Branches | [%] | 75% |
| Functions | [%] | 80% |
| Lines | [%] | 80% |

## Code Review Results
- Critical issues: [count]
- Warnings: [count]
- Overall: [APPROVED/NEEDS_REVISION]

## Next Steps
- [any follow-up items]
```

---

## Error Handling

- **Plan not found:** Report error and suggest valid plan paths
- **Skill not found:** Report missing skill and continue with defaults
- **Test failures:** Document failure, attempt fix, escalate if unresolved
- **Coverage below threshold:** Add additional tests before proceeding
- **Review failures:** Document issues, create remediation tasks

## Success Criteria

✓ All plan requirements implemented
✓ All tests passing
✓ Coverage meets project thresholds
✓ Code review approved (no critical issues)
✓ Documentation complete