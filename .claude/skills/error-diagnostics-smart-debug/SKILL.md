---
name: error-diagnostics-smart-debug
description: "AI-assisted debugging w/ observability, root cause analysis, hypothesis generation"
---

# Smart Debug

AI-assisted debugging specialist. Detailed examples: `resources/implementation-playbook.md`.

## Use When
- Debugging production/staging issues
- Root cause analysis needed

## Process: $ARGUMENTS

Parse for: error messages/stack traces, repro steps, affected components, perf characteristics, env (dev/staging/prod), failure pattern (intermittent/consistent).

### 1. Triage
AI-powered analysis: error pattern recognition, stack trace analysis, component dependency analysis, severity assessment. Generate 3-5 ranked hypotheses.

### 2. Observability Data
Gather: Sentry/Rollbar (errors), DataDog/New Relic (APM), Jaeger/Honeycomb (traces), ELK/Splunk (logs).

Query: error frequency/trends, affected users, env-specific patterns, deployment correlation.

### 3. Hypotheses
Per hypothesis: probability (0-100%), evidence, falsification criteria, testing approach.

Categories: logic errors (race conditions, null handling), state mgmt (stale cache, transitions), integration (API changes, timeouts), resource exhaustion (memory leaks, connection pools), config drift, data corruption.

### 4. Strategy Selection

| Strategy | When | Tools |
|---|---|---|
| Interactive | Reproducible locally | VS Code/Chrome DevTools |
| Observability | Production issues | Sentry/DataDog/Honeycomb |
| Time-Travel | Complex state | rr/Redux DevTools |
| Chaos | Intermittent under load | Chaos Monkey/Gremlin |
| Statistical | Small % of cases | Delta debugging |

### 5. Instrumentation
Optimal breakpoint/logpoint locations: entry points, decision nodes, state mutations, integration boundaries, error paths. Use conditional breakpoints for prod-like envs.

### 6. Production-Safe Techniques
- OpenTelemetry spans (non-invasive)
- Feature-flagged debug logging
- Sampling-based profiling (Pyroscope)
- Read-only debug endpoints (auth + rate-limited)
- Canary deploy (10% traffic)

### 7. Root Cause Analysis
Full execution path reconstruction, variable state tracking, dependency analysis, timing diagrams, similar bug pattern ID, fix complexity estimation.

### 8. Fix & Validate
Code changes + impact assessment + risk level + rollback strategy.

Post-fix: run tests, perf comparison, canary deploy, AI review.
Success: tests pass, no perf regression, error rate stable/decreased.

### 9. Prevention
Regression tests, knowledge base update, monitoring/alerts, runbook docs.

## Output
1. **Issue Summary:** Error, frequency, impact
2. **Root Cause:** Diagnosis w/ evidence
3. **Fix Proposal:** Changes, risk, impact
4. **Validation Plan:** Verification steps
5. **Prevention:** Tests, monitoring, docs
