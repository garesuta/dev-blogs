---
name: error-debugging-error-trace
description: "Error tracking & monitoring: set up tracking systems, alerts, structured logging"
---

# Error Tracking & Monitoring

## Use When
- Implementing | improving error monitoring
- Configuring alerts, grouping, triage workflows
- Setting up structured logging & tracing

## Skip When
- No runtime/monitoring access | unrelated to observability | one-off bug fix

## Process: $ARGUMENTS

1. Assess current error capture, alerting, grouping
2. Define severity levels & triage workflows
3. Configure logging, tracing, alert routing
4. Validate signal quality w/ test errors

Detailed patterns: `resources/implementation-playbook.md`

## Safety
- Never log secrets, tokens, PII
- Safe sampling to prevent prod overload
