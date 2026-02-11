---
name: code-quality
description: Multi-language code quality & review for TS, Python, Go, Rust. Type safety, security, perf, maintainability. Review process, checklist, PEP 8 deep-dive.
author: George Khananaev
replaces: [beautiful-code, code-reviewer, pep8]
---

# Code Quality

## When to Use

- Writing | reviewing code in TS/Python/Go/Rust
- PR analysis | security/perf audit
- Setting up linting/CI
- Python style check (PEP 8)

## Quick-Start

| Intent | Sections |
|---|---|
| Write code | Core Rules + Language Standards + AI-Friendly |
| Review PR | Review Process + `references/checklist.md` + Severity |
| Setup CI | Config Files + Scripts + Enforcement |
| Python style | `references/python.md` (full PEP 8) |

Load relevant `references/` file for deep reviews.

## Quick Reference

| Lang | Type Safety | Linter | Max Complexity |
|---|---|---|---|
| TS | `strict`, no `any` | ESLint + typescript-eslint | 10 |
| Python | mypy `strict`, PEP 484 | Ruff + mypy | 10 |
| Go | staticcheck | golangci-lint | 10 |
| Rust | clippy pedantic | clippy + cargo-audit | - |

## Severity

| Level | Action |
|---|---|
| **Critical** | Security vulns, data loss -> block merge |
| **Error** | Bugs, type violations, `any` -> block merge |
| **Warning** | Code smells, complexity -> must address |
| **Style** | Formatting, naming -> auto-fix |

## Core Rules (All Languages)

**Type Safety:** No implicit any/untyped fns. No type assertions w/o guards. Explicit return types on public APIs.

**Security:** No hardcoded secrets (gitleaks). No eval/pickle/unsafe deserialization. Parameterized queries only. SCA: npm audit / pip-audit / govulncheck / cargo-audit.

**Complexity:** Max cyclomatic: 10. Max fn lines: 50. Max nesting: 3. Max params: 5.

**Error Handling:** No ignored errors (Go: no `_` for err). No bare except (Python). No unwrap in prod (Rust). Wrap errors w/ context.

## Language Standards

### TypeScript (`references/typescript.md`)
```typescript
const bad: any = data;                          // Error: never use any
const good: unknown = data;                     // OK
const bad2 = data as User;                      // Error: no assertions
const good2 = isUser(data) ? data : null;       // OK
const bad3 = user!.name;                        // Error: non-null assertion
const good3 = user?.name ?? '';                  // OK
```

### Python (`references/python.md`)
```python
def bad(data): return data                      # Error: untyped
def good(data: dict[str, Any]) -> list[str]:    # OK
    return list(data.keys())
value: str | None = None                        # OK (not Optional)
```

### Go (`references/go.md`)
```go
result, _ := doSomething()                      // Error: ignored error
result, err := doSomething()                    // OK
if err != nil { return fmt.Errorf("context: %w", err) }
```

### Rust (`references/rust.md`)
```rust
let value = data.unwrap();                      // Error: no unwrap in prod
let value = data?;                              // OK
```

## Cross-Language

**Logging:** Structured (pino/structlog/zerolog). See `references/logging.md`.

**Coverage:** Line 80% min, Branch 70% min, New code 90% min. See `references/testing.md`.

**Security:** gitleaks pre-commit + CI, SCA scanning, jsx-a11y (TS), `-race` (Go). See `references/security.md`.

**API Design:** Proper HTTP codes, RFC 7807 errors, plural nouns `/users/{id}/orders`, validate at boundary. See `references/api-design.md`.

**DB:** Transactions for multi-write, N+1 prevention, expand-contract migrations, paginate lists. See `references/database.md`.

**Async:** Resource cleanup (try/finally, defer, Drop), timeouts on all async ops, semaphores for rate limiting. See `references/async-concurrency.md`.

## Review Process

1. **Context:** ID language/framework, understand purpose, check patterns, review tests
2. **Systematic:** Use `references/checklist.md` (quality, security, perf, errors, tests, best practices)
3. **Report:** `[SEVERITY] Issue Title` w/ File:line, Problem, Impact, Fix

### Output Format
```markdown
# Code Review Summary
## Overview
Files: X | Issues: Y (X Critical, Y Error, Z Warning) | Rec: Approve|Request Changes
## Critical Issues / Error Issues / Warnings / Style
## Positive Observations
```

## Naming

| Element | TS | Python | Go | Rust |
|---|---|---|---|---|
| Vars/Fns | camelCase | snake_case | camelCase | snake_case |
| Constants | SCREAMING | SCREAMING | MixedCaps | SCREAMING |
| Types | PascalCase | PascalCase | PascalCase | PascalCase |
| Files | kebab-case | snake_case | lowercase | snake_case |

## AI-Friendly Patterns

1. Explicit types always
2. Single responsibility per fn
3. Small fns (<30 lines)
4. Max nesting 3
5. Guard clauses for early returns
6. Named constants, no magic values

## Enforcement (Ratchet)

```
Phase 1: Errors block, Warnings tracked
Phase 2: Strict on NEW files only
Phase 3: Strict on TOUCHED files
Phase 4: Full enforcement
```

| Mode | Trigger | Behavior |
|---|---|---|
| WIP | Local commit | Warnings only |
| Push | git push | Errors block |
| PR | PR to main | Full strict |

## Scripts

- `scripts/check_changed.sh` — Monorepo incremental lint
- `scripts/check_all.sh` — Full repo check
- `scripts/check_style.py` — Python full (ruff + pycodestyle + mypy)
- `scripts/check_pep8.sh` — Quick PEP 8
- `scripts/check_types.sh` — Python type hints
- `scripts/fix_style.sh` — Python auto-fix
