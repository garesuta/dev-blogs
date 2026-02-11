---
name: error-diagnostics-error-analysis
description: "Error analysis for distributed systems, production incidents, observability"
---

# Error Analysis & Resolution

Expert error analysis: distributed systems debugging, production incidents, observability.

## Use When
- Investigating production incidents | recurring errors
- Root-cause analysis across services
- Designing observability improvements

## Skip When
- Pure feature dev | no access to logs/traces | unrelated to reliability

## Process: $ARGUMENTS

1. Gather error context, timestamps, affected services
2. Reproduce | narrow issue w/ targeted experiments
3. Identify root cause, validate w/ evidence
4. Propose fixes, tests, preventive measures

Detailed playbooks: `resources/implementation-playbook.md`

## Safety
- No prod changes w/o approval & rollback plan
- Redact secrets & PII from diagnostics
