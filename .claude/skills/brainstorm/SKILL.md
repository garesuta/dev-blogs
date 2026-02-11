---
name: brainstorm
description: Transform ideas into designs through collaborative dialogue. Use for brainstorming features, exploring impl approaches, designing architecture, or refining vague ideas. Incremental validation w/ 200-300 word sections.
---

# Brainstorm

Transform ideas into designs & specs through collaborative dialogue.

## When to Use

- User has idea needing refinement ("I want to add...")
- Feature needs design exploration before impl
- Multiple approaches exist, trade-offs need evaluation
- Requirements unclear | partially defined

## Process

### Phase 1: Context Gathering

Before asking questions:
1. Check project structure (Glob key dirs)
2. Review recent commits (`git log --oneline -10`)
3. Read relevant existing code/docs
4. Identify existing patterns & conventions

### Phase 2: Idea Refinement

**One question at a time.** Prefer multiple-choice (2-4 opts, recommended first).

| Category | Examples |
|---|---|
| Purpose | What problem? Who benefits? |
| Constraints | Must integrate w/ X? Budget/time? |
| Success | How to measure? Key metrics? |
| Scope | What's explicitly excluded? |

**Exit:** Stop when purpose, constraints, success criteria are clear.

### Phase 3: Approach Exploration

Present 2-3 approaches w/ trade-offs. Lead w/ recommendation & explain why.

```markdown
## Approach A: [Name] (Recommended)
- **Pros**: ... | **Cons**: ... | **Best when**: ...
## Approach B: [Name]
- **Pros**: ... | **Cons**: ... | **Best when**: ...
```

### Phase 4: Incremental Design

**Each section: 200-300 words max.** After each, ask: "Does this look right?"

1. **Overview** — Goal, scope, success metrics
2. **Architecture** — Components, data flow, boundaries
3. **Data Model** — Schema, relationships (if applicable)
4. **Error Handling** — Failure modes, recovery
5. **Testing Strategy** — What & how to test

Proceed only after user confirms each section.

### Phase 5: Documentation

1. Compile into single design doc
2. Write to `docs/plans/YYYY-MM-DD-<topic>-design.md`
3. Commit

### Phase 6: Impl Setup (Optional)

Ask: "Ready to set up for implementation?" If yes:
1. Use `using-git-worktrees` for isolated workspace
2. Use `/plan-feature` for detailed TDD impl plan

## YAGNI

| Red Flag | Ask |
|---|---|
| "It might be useful to..." | "Need for MVP?" |
| "We could also add..." | "Solving stated problem?" |
| "Just in case..." | "Likelihood needed?" |

**Default: Remove it.**

## Design Doc Template

```markdown
# Feature: [Name]
Date: YYYY-MM-DD
## 1. Overview
Goal | Success Metrics | In Scope | Out of Scope
## 2. Architecture
[Diagram/description] + Data Flow
## 3. Data Model (if applicable)
## 4. Error Handling
| Scenario | Response |
## 5. Testing Strategy
| Type | Coverage | Focus |
## 6. Open Questions
```

## Anti-Patterns

| Don't | Do |
|---|---|
| 5 questions at once | One per message |
| Full design dump | 200-300 word sections |
| Skip context | Check project state first |
| Single approach | 2-3 w/ trade-offs |
| Assume requirements | Ask until clear |
| Over-engineer | YAGNI |

## Integration

- `gemini-cli` — Alternative perspectives (Phase 3)
- `using-git-worktrees` — Isolated workspace (Phase 6)
- `/plan-feature` — TDD impl plans (Phase 6)
