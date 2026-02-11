---
name: brainstorming
description: >
  Use before creative/constructive work (features, components, architecture, behavior changes).
  Transforms vague ideas into validated designs through disciplined, incremental reasoning.
---

# Brainstorming: Ideas Into Designs

Turn raw ideas into **validated designs & specs** through structured dialogue **before impl**.

Prevents: premature impl, hidden assumptions, misaligned solutions, fragile systems.

**No implementation while this skill is active.**

## Operating Mode

Design facilitator & senior reviewer, not builder. No creative impl. No speculative features. No silent assumptions. No skipping ahead.

## Process

### 1. Context (Mandatory First)

Before questions: review project state (files, docs, plans, prior decisions). Identify existing vs proposed. Note unconfirmed constraints. **Do not design yet.**

### 2. Understanding (One Question at a Time)

- One question per message
- Prefer multiple-choice
- Open-ended only when necessary
- Focus: purpose, target users, constraints, success criteria, non-goals

### 3. Non-Functional Requirements (Mandatory)

Clarify | propose assumptions for: perf expectations, scale (users/data/traffic), security/privacy, reliability/availability, maintenance/ownership.

If user unsure: propose reasonable defaults, mark as **assumptions**.

### 4. Understanding Lock (Hard Gate)

Before ANY design, provide:
- **Summary** (5-7 bullets): what, why, who, constraints, non-goals
- **Assumptions** list
- **Open Questions** list

Ask: "Does this reflect your intent? Confirm before we proceed."

**Do NOT proceed w/o explicit confirmation.**

### 5. Design Approaches

Propose 2-3 viable approaches. Lead w/ recommendation. Trade-offs: complexity, extensibility, risk, maintenance. **YAGNI ruthlessly.**

### 6. Present Design (Incrementally)

Sections of **200-300 words max**. After each: "Does this look right?"

Cover: architecture, components, data flow, error handling, edge cases, testing.

### 7. Decision Log (Mandatory)

Per decision: what decided, alternatives considered, why chosen. Preserve for docs.

## After Design

### Documentation
Write validated design to durable format (Markdown). Include: understanding summary, assumptions, decision log, final design.

### Impl Handoff (Optional)
Only after docs complete. Ask: "Ready for implementation?" If yes: create impl plan, isolate work, proceed incrementally.

## Exit Criteria (Hard Stop)

ALL must be true:
- Understanding Lock confirmed
- Design approach accepted
- Assumptions documented
- Risks acknowledged
- Decision Log complete

If unmet: continue refinement. **Do NOT proceed to impl.**

## Principles (Non-Negotiable)

- One question at a time
- Explicit assumptions
- Explore alternatives
- Validate incrementally
- Clarity over cleverness
- **YAGNI ruthlessly**

---
High-impact/high-risk designs -> hand off to `multi-agent-brainstorming` before impl.
