---
name: plan-feature
description: Production-grade feature planning with multi-agent validation orchestration
tools:
  - AskUserQuestion
  - Bash(gemini *)
  - Read
  - Glob
  - Grep
  - WebSearch
---

# Plan Feature Command (v2 — Multi-Agent)

**Trigger: `/plan-feature` only. Creates production-grade implementation plans with multi-agent validation.**

## 1. Discovery Phase (Adaptive)

### Round 1: Core Questions (ALWAYS)

Use `AskUserQuestion`:

| Q# | Question | Header | Options |
|----|----------|--------|---------|
| 1 | What user problem does this solve? | Problem | [Describe, Show existing code] |
| 2 | What's explicitly OUT of scope? | Anti-scope | [List exclusions, Nothing specific, Help define] |
| 3 | Risk level if this fails in prod? | Risk | [Critical, High, Medium, Low] |

### Round 2: Adaptive Questions

Based on Round 1, ask ONLY relevant follow-ups:

| Trigger | Questions to Ask |
|---------|------------------|
| DB likely (data/store/CRUD keywords) | Schema changes? Migration strategy? |
| Frontend (UI/page/component) | WCAG level? Design specs available? |
| Security-sensitive (Risk=Critical/High OR auth/payment/PII) | Compliance (SOC2/GDPR)? Security requirements? |
| New dependencies (library/integration/API) | Alternatives evaluated? Vendor lock-in? |
| Performance-critical | Latency budget? Expected load? |

### Exit Criteria

Stop when: Requirements unambiguous, edge cases documented, success metrics defined.

**Rule: Keep asking until EVERYTHING is clear. Never guess.**

## 2. Research Phase

### Codebase Archaeology

```bash
# Find similar patterns
Grep: "similar feature keywords"
Glob: affected file patterns
Read: existing architecture
```

### External Research (if gaps)

- Context7: Framework best practices
- WebSearch: Latest docs, security advisories

### Pre-Mortem

Before drafting, answer:
- "If this fails in 6 months, what caused it?"
- "What breaks at 10x scale?"

## 3. Plan Template (6 Sections)

```markdown
# Feature: [Name]

## 1. Overview
- **Goal**: One-line summary
- **Success Metrics**: How we measure success
- **In Scope**: What we ARE building
- **Out of Scope**: What we are NOT building

## 2. Technical Design

### Architecture
[Component A] → [Component B] → [Component C]

### Data Model (if applicable)
- Schema changes
- Migration: Expand-Contract pattern (zero-downtime)

### Security (if applicable)
| Risk | Mitigation |
|------|------------|
| XSS | Input sanitization, CSP |
| Injection | Parameterized queries |

### Performance (if applicable)
- Caching strategy (TTL, invalidation)
- Query optimization (indexes, N+1)

## 3. Implementation

### Phase 1: Setup
- [ ] Feature flag
- [ ] Interfaces/contracts
- [ ] DB migration (additive only)

### Phase 2: Core
- [ ] Step 2.1: ...
- [ ] Step 2.2: ...

### Phase 3: Integration
- [ ] Step 3.1: ...
- [ ] Rollback checkpoint ←

## 4. Testing
| Type | Coverage | Focus |
|------|----------|-------|
| Unit | 80%+ | Core logic |
| Integration | APIs | Contracts |
| E2E | Critical paths | User flows |

## 5. Rollout & Observability
| Stage | % Users | Duration | Success Criteria |
|-------|---------|----------|------------------|
| Canary | 1% | 24h | Error <0.1% |
| Beta | 10% | 48h | P95 <Xms |
| GA | 100% | - | All green |

**Logs**: Key events | **Metrics**: Latency, errors | **Alerts**: Thresholds

## 6. Rollback Plan
1. Disable feature flag (instant)
2. Revert migration (if needed)
3. Restore cached data
```

## 4. Multi-Agent Validation Orchestration

Replaces simple dual-AI check with specialized agent coordination.

### 4.1 Agent Registry

| Agent ID | Role | Expertise | Weight |
|----------|------|-----------|--------|
| `security-auditor` | OWASP, auth, data protection | Vulnerabilities, threat modeling | 0.25 |
| `architecture-reviewer` | System design, patterns | Coupling, scalability, maintainability | 0.25 |
| `performance-analyst` | Load, latency, resources | Bottlenecks, caching, N+1 | 0.20 |
| `sre-ops` | Reliability, observability | Failure modes, monitoring, rollback | 0.15 |
| `dx-reviewer` | Developer experience | API ergonomics, testability, docs | 0.15 |

### 4.2 Dynamic Agent Selection

Not every feature needs all agents. Route based on feature context:

```
ROUTING RULES:
─────────────────────────────────────────────────────────
Feature Context           → Agents Activated
─────────────────────────────────────────────────────────
ANY feature               → architecture-reviewer (always)
Risk = Critical/High      → ALL agents
Auth/payment/PII          → + security-auditor (weight → 0.35)
DB/schema changes         → + performance-analyst, sre-ops
Frontend/UI               → + dx-reviewer
New external dependency   → + security-auditor, architecture-reviewer
Performance-critical      → + performance-analyst (weight → 0.30)
─────────────────────────────────────────────────────────
Minimum: 2 agents | Maximum: all 5
```

### 4.3 Execution Strategy

```
┌─────────────────────────────────────────────┐
│           PHASE 1: PARALLEL (independent)    │
│                                              │
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │  security-    │  │  performance-        │ │
│  │  auditor      │  │  analyst             │ │
│  └──────┬───────┘  └──────────┬───────────┘ │
│         │                     │              │
├─────────┴─────────────────────┴──────────────┤
│           PHASE 2: SEQUENTIAL (informed)     │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │  architecture-reviewer               │    │
│  │  (receives Phase 1 insights)         │    │
│  └──────────────┬───────────────────────┘    │
│                 │                             │
│  ┌──────────────┴───────────────────────┐    │
│  │  sre-ops                             │    │
│  │  (receives Phase 1+2 insights)       │    │
│  └──────────────────────────────────────┘    │
├──────────────────────────────────────────────┤
│           PHASE 3: SYNTHESIS                 │
│  ┌──────────────────────────────────────┐    │
│  │  Conflict resolution + final report  │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

### 4.4 Agent Execution (via Gemini)

Each agent is a **single Gemini call with a specialized persona prompt**.

**Parallel Agents (Phase 1):**

```bash
# Call 1 — Security Auditor
gemini "You are a Senior Security Engineer reviewing a feature plan.

REVIEW FOCUS:
1. OWASP Top 10 vulnerabilities in this design
2. Authentication/authorization gaps
3. Data exposure risks (PII, secrets, logs)
4. Input validation blind spots

OUTPUT FORMAT:
- CRITICAL: [issues that block shipping]
- WARNING: [issues to fix before GA]
- INFO: [hardening suggestions]

PLAN:
[paste sections 1-3 of plan]"

# Call 2 — Performance Analyst
gemini "You are a Senior Performance Engineer reviewing a feature plan.

REVIEW FOCUS:
1. Query patterns that degrade at 10x/100x scale
2. Missing indexes, N+1 queries, unbounded results
3. Caching gaps (what should be cached, TTL strategy)
4. Resource contention and concurrency issues

OUTPUT FORMAT:
- CRITICAL: [perf issues causing outages at scale]
- WARNING: [degradation risks]
- OPTIMIZATION: [quick wins with high impact]

PLAN:
[paste sections 2-3 of plan]"
```

**Sequential Agent (Phase 2 — receives Phase 1 context):**

```bash
# Call 3 — Architecture + SRE Combined Review
gemini "You are a Principal Engineer doing final architecture review.
You have input from Security and Performance teams below.

PRIOR FINDINGS:
- Security: [summary of Call 1 results]
- Performance: [summary of Call 2 results]

REVIEW FOCUS:
1. Are the security/perf mitigations architecturally sound?
2. Coupling analysis — what breaks if component X changes?
3. Failure modes: what wakes you at 3 AM?
4. Rollback completeness — can we safely undo this?
5. Pre-mortem: this feature failed in 6 months — top 3 causes

OUTPUT FORMAT:
- BLOCKING: [must fix before implementation]
- RISKS: [tracked risks with mitigations]
- READINESS SCORE: 1-10
- VERDICT: APPROVED / NEEDS REVISION / REJECTED

PLAN:
[paste full plan]"
```

**Total Gemini calls: 3 (was 2, but now covers 5 agent perspectives with context chaining)**

### 4.5 Conflict Resolution

When agents disagree:

```
RESOLUTION RULES:
─────────────────────────────────────────────────────
Conflict Type                → Resolution
─────────────────────────────────────────────────────
Security vs Performance      → Security wins (always)
Architecture vs DX           → Architecture wins (prod)
                               DX wins (internal tooling)
Multiple CRITICAL findings   → ALL must be addressed
Contradictory suggestions    → Principal review (Call 3)
                               makes final call
Score < 8 with CRITICAL=0    → Ask user: ship or iterate?
─────────────────────────────────────────────────────
```

### 4.6 Result Synthesis

Claude consolidates all agent outputs into a single validation report:

```markdown
## Validation Report

### Agent Results Summary
| Agent | Critical | Warning | Score |
|-------|----------|---------|-------|
| Security Auditor | 0 | 2 | 8/10 |
| Performance Analyst | 1 | 1 | 6/10 |
| Principal Review | 0 | 3 | 7/10 |

### Weighted Readiness Score
Score = Σ(agent_score × agent_weight) → X.X/10

### Blocking Issues (must resolve)
1. [Issue from agent] → [Proposed fix]

### Tracked Risks (acceptable with mitigation)
1. [Risk] → [Mitigation] → [Owner]

### Verdict: APPROVED / NEEDS REVISION / REJECTED
```

### 4.7 Acceptance Criteria

- [ ] Claude self-check: All internal checks PASS
- [ ] Phase 1 agents: No unresolved CRITICAL issues
- [ ] Phase 2 principal review: Score ≥ 8/10
- [ ] Weighted readiness score ≥ 7.5/10
- [ ] All BLOCKING issues have proposed fixes in plan
- [ ] **Plan saved to `docs/plan/YYYY/MM/YYYY-MM-DD-HHmm-feature-name.md`**

## 5. Execution Flow

```
DISCOVER → RESEARCH → PLAN → VALIDATE → REFINE → SAVE
    │          │         │        │          │       │
 Adaptive   Grep+C7   6-section  Multi-   Iterate  Auto-save
 questions            template   Agent    until     with
                                 Orchestr  score≥8  metadata
                                 (3 calls)
```

## 5.1 Plan Persistence

### Auto-Save on Finalization

When all acceptance criteria pass, save the plan:

```bash
mkdir -p docs/plan/$(date +%Y)/$(date +%m)

FILENAME="docs/plan/$(date +%Y)/$(date +%m)/$(date +%Y-%m-%d-%H%M)-$(echo "[FEATURE_NAME]" | tr '[:upper:]' '[:lower:]' | tr ' ' '-').md"

cat > "$FILENAME" << 'EOF'
---
created: [DATE]
status: approved
readiness_score: [WEIGHTED_SCORE]/10
agents_used: [LIST]
critical_issues_resolved: [COUNT]
author: [USER]
---

[FULL PLAN CONTENT]

---
## Appendix: Validation Report
[SYNTHESIS REPORT FROM 4.6]
EOF
```

### File Naming Convention

| Component | Format | Example |
|-----------|--------|---------|
| **Full path** | `docs/plan/YYYY/MM/YYYY-MM-DD-HHmm-feature-name.md` | `docs/plan/2025/01/2025-01-16-1430-user-auth-flow.md` |

## 6. Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| Guess requirements | Use AskUserQuestion iteratively |
| Ask all 10 questions | Adaptive — only relevant ones |
| Skip Claude self-check | Always self-check first (free) |
| Run 5 separate Gemini calls | Consolidate to 3 with context chaining |
| Activate all agents for simple features | Dynamic routing — min 2, max 5 |
| Ignore agent conflicts | Apply resolution rules, escalate to user |
| Over-engineer | Minimal viable, iterate |
| Destructive migrations | Additive-only, expand-contract |
| Skip observability | Every feature needs monitoring |
| Save plan without validation report | Always append synthesis as appendix |

---
Integrates: gemini-cli, multi-agent orchestration, context7, AskUserQuestion
