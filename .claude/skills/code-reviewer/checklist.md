# Code Review Checklist

## Quick Reference Checklist

Use this checklist systematically when reviewing code.

---

## 1. Code Quality & Best Practices

### Structure & Architecture (SOLID)

- [ ] **Single Responsibility:** Functions and classes have a single, focused purpose (SRP).
- [ ] **Function Size:** Functions are small and scannable (ideal < 50 lines).
- [ ] **Dependencies:** Dependencies are explicitly defined or injected (DIP); no tight coupling.
- [ ] **Organization:** File structure is logical and follows framework conventions.
- [ ] **Modularity:** No circular dependencies between modules or files.

### Clean Code (DRY & Readability)

- [ ] **DRY Principle:** No code duplication; common logic is abstracted into helper functions.
- [ ] **Dead Code:** No unused variables, imports, or commented-out code blocks.
- [ ] **Constants:** Magic numbers and strings are extracted into named constants.
- [ ] **Complexity:** Deep nesting (arrows code) is avoided; early returns are used.
- [ ] **Self-Documenting:** Code is readable enough that comments explain *why*, not *what*.

### Naming Conventions

- [ ] **Descriptive:** Variables and functions have meaningful, pronounceable names.
- [ ] **Action-Oriented:** Functions are verb-based (e.g., `getUser`, `calculateTotal`).
- [ ] **Consistency:** Naming conventions (camelCase, snake_case) are consistent across the project.
- [ ] **Booleans:** Boolean variables utilize prefixes (is, has, should, can).
- [ ] **No Cryptic Abbreviations:** Abbreviations are avoided unless universally understood (e.g., ID, HTML).

### Error Handling & Observability

- [ ] **Error Catching:** Errors are properly caught and handled; no empty `catch` blocks.
- [ ] **Specific Errors:** Specific error types are used rather than generic Exceptions.
- [ ] **Logging:** meaningful logs are implemented with appropriate levels (Info, Warn, Error).
- [ ] **Context:** Logs contain sufficient context (IDs, state) to debug issues.
- [ ] **Failure States:** Application handles failure states gracefully (no crashing the UI).

### Code & API Documentation

- [ ] **Public APIs:** All public methods, interfaces, and classes have JSDoc/Docstrings.
- [ ] **Details:** Function parameters and return values are explicitly documented.
- [ ] **Complex Logic:** Complex algorithms have inline comments explaining *why* (business logic), not just *what*.
- [ ] **Examples:** Usage examples are provided in comments for non-obvious utilities.

### Project & External Documentation

- [ ] **README:** Updated with current setup instructions, architecture decisions, and prerequisites.
- [ ] **API References:** External API documentation (e.g., Swagger/OpenAPI) is synced with code changes.
- [ ] **Changelog:** All notable changes are recorded in the changelog (keep a "Unreleased" section).
- [ ] **Migration Guides:** Instructions are provided for any breaking changes or deprecated features.

### Type Safety (TypeScript/Typed Langs)

- [ ] **Strict Typing:** No implicit `any`; explicit types are used.
- [ ] **Null Checks:** Proper handling of `null` and `undefined` values.
- [ ] **Generics:** Generic types are used to maintain flexibility without losing type safety.
- [ ] **Return Types:** Function return types are explicitly defined.

---

## 2. Security

### Input Validation

*Focus: SQL Injection, Path Traversal, and Command Injection*

- [ ] **Strict Input Validation:** All user input is validated against strict allow-lists (type, length, format).
- [ ] **SQL Injection Prevention:** SQL queries use parameterized statements or ORM binding; no raw string
  concatenation.
- [ ] **Path Traversal Protection:** File paths are validated; users cannot manipulate file path inputs (e.g., `../`).
- [ ] **Command Injection:** User input is never passed directly to system shell commands.
- [ ] **Sanitization:** Input is sanitized before processing to prevent malicious payload execution.

### Authentication & Authorization

*Focus: Auth Flaws, Broken Access Control, and Session Hijacking*

- [ ] **Access Control:** Authorization checks are enforced at the server side for every request (prevent IDOR/broken
  access control).
- [ ] **Secure Sessions:** Session management uses secure, HTTP-only, and SameSite cookies.
- [ ] **Token Security:** Tokens (JWTs) are signed using strong algorithms and have appropriate expiration times.
- [ ] **Credential Handling:** Password handling follows best practices (hashing/salting); no weak password policies.
- [ ] **Route Protection:** All sensitive routes and API endpoints are behind authentication barriers.

### Data Protection & Cryptography

*Focus: Insecure Cryptography, Hardcoded Secrets, and Data Exposure*

- [ ] **Secret Management:** No hardcoded secrets, keys, or credentials in the source code or version control.
- [ ] **Strong Cryptography:** Use industry-standard algorithms (e.g., AES-256, RSA); avoid deprecated protocols (e.g.,
  MD5, SHA-1).
- [ ] **Data at Rest/Transit:** Sensitive data is encrypted at rest and communication uses HTTPS/TLS 1.2+.
- [ ] **PII Handling:** Personally Identifiable Information is minimized and handled according to compliance (
  GDPR/CCPA).
- [ ] **Log Hygiene:** Logs do not contain sensitive data (passwords, tokens, PII).

### Application Integrity & Common Vulnerabilities

*Focus: XSS, CORS, Deserialization, and Dependencies*

- [ ] **XSS Prevention:** Content Security Policy (CSP) is implemented; output encoding is used to prevent Cross-Site
  Scripting.
- [ ] **CORS Configuration:** Cross-Origin Resource Sharing (CORS) is configured strictly (no
  `Access-Control-Allow-Origin: *` for sensitive data).
- [ ] **Dependency Management:** All third-party libraries are scanned for known vulnerabilities (e.g., `npm audit`,
  OWASP Dependency-Check).
- [ ] **Secure Deserialization:** Untrusted data is never deserialized without validation to prevent remote code
  execution.
- [ ] **CSRF Protection:** Anti-CSRF tokens are implemented on state-changing requests.
- [ ] **Error Handling:** Error messages are generic and do not leak stack traces or internal system details.

---

## 3. Performance

### Database

- [ ] **Query Efficiency:** No N+1 query patterns are present.
- [ ] **Indexing:** Appropriate indexes exist for frequent query patterns.
- [ ] **Optimization:** Complex queries are optimized (avoid full table scans).
- [ ] **Configuration:** Connection pooling is configured correctly.
- [ ] **Integrity:** Transactions are used appropriately for atomic operations.

### Memory & Resources

- [ ] **Leak Prevention:** No memory leaks; event listeners and large objects are cleaned up/disposed.
- [ ] **Subscription Management:** Observables/subscriptions are unsubscribed on component destruction.
- [ ] **Caching Strategy:** Caching is implemented where beneficial (Redis, HTTP cache, etc.).
- [ ] **Resource Usage:** Large assets are lazy-loaded; unnecessary resources are released.

### Algorithmic Efficiency

- [ ] **Complexity:** Algorithm time/space complexity is acceptable (avoid O(n^2) or worse on large datasets).
- [ ] **Data Structures:** Appropriate data structures are used (e.g., Map vs Array for lookups).
- [ ] **Loop Optimization:** No unnecessary iterations, redundant loops, or computations inside loops.
- [ ] **Data Handling:** Pagination or virtualization is used for large datasets.

### Frontend Specific

- [ ] **Rendering:** Components avoid unnecessary re-renders (use memoization/OnPush).
- [ ] **Network:** Payloads are minimized; no excessive network calls (chattiness).
- [ ] **Responsiveness:** No blocking operations on the main thread (Web Workers used for heavy calc).
- [ ] **Assets:** Bundle size is minimized/split; images are optimized and properly sized.
- [ ] **User Interaction:** Debouncing or throttling is applied to frequent events (scroll, resize, input).
- [ ] **Critical Path:** Critical rendering path is minimized (defer non-essential scripts).

---

## 4. Error Handling & Edge Cases

### Exception Management

- [ ] **Trapping:** Errors are caught at appropriate levels (Global vs. Local handlers).
- [ ] **Logging:** Errors are logged with sufficient context (stack trace, user ID, state).
- [ ] **User Feedback:** User-facing error messages are friendly and actionable.
- [ ] **Security:** Error responses do not expose internal implementation details (stack traces, DB structure).
- [ ] **Graceful Degradation:** The application remains partially functional even when a non-critical component fails.

### Input & Boundary Edge Cases

- [ ] **Null/Empty States:** `null`, `undefined`, empty arrays, and empty objects are handled safely.
- [ ] **Numeric Boundaries:** Zero, negative numbers, and maximum/minimum integer limits are tested.
- [ ] **Valid but Unusual:** Unusual but valid input combinations are verified (e.g., special characters in names,
  maximum string lengths).
- [ ] **Localization:** Locale-specific formats (dates, currencies) and Timezone edge cases are handled correctly.

### System & Infrastructure Edge Cases

- [ ] **Network Issues:** Network failures (offline) and timeouts are handled with user feedback.
- [ ] **Concurrency:** Race conditions and concurrent access scenarios are mitigated (e.g., locking, atomic updates).
- [ ] **File System:** File system errors (permissions denied, disk full, missing files) are caught.
- [ ] **Environment:** Application behavior is verified when environment variables are missing or malformed.

### Resilience & Recovery

- [ ] **Retry Logic:** Transient errors (network blips) trigger retries with exponential backoff.
- [ ] **Circuit Breakers:** Circuit breaker patterns are implemented for external service dependencies.
- [ ] **Transactions:** Rollback mechanisms are in place for failed multi-step operations.
- [ ] **Cleanup:** Resources (spinners, file handles, memory) are cleaned up/reset upon failure.

---

## 5. Testing

### Coverage

- [ ] Unit tests for business logic
- [ ] Integration tests for APIs
- [ ] Edge cases are tested
- [ ] Error scenarios are tested
- [ ] Mocks are appropriate

### Quality

- [ ] Tests are readable
- [ ] Tests are independent
- [ ] No flaky tests
- [ ] Test data is representative
- [ ] Assertions are meaningful

---

## 6. Git & Versioning

### Commit Quality

- [ ] Commits are atomic
- [ ] Commit messages are descriptive
- [ ] No unrelated changes bundled
- [ ] No sensitive data in commits

### PR Quality

- [ ] PR description is complete
- [ ] Breaking changes are noted
- [ ] Migration steps if needed
- [ ] Screenshots for UI changes

---

## Severity Guide

| Finding                | Severity |
|------------------------|----------|
| Security vulnerability | Critical |
| Data corruption risk   | Critical |
| Breaking production    | Critical |
| Significant bug        | High     |
| Performance regression | High     |
| Missing error handling | Medium   |
| Code quality issue     | Medium   |
| Minor optimization     | Low      |
| Style preference       | Low      |
| Enhancement idea       | Info     |

---

## Review Notes Template

```markdown
## File: `path/to/file.ts`

### Critical

- Line X: [Detailed explanation of the issue]
    - Impact: [What could go wrong]
    - Fix: [Suggested solution]

### High

- [Issues...]

### Medium

- [Issues...]

### Positive

- Good use of [pattern/practice]
- Well-structured [component/function]

```
