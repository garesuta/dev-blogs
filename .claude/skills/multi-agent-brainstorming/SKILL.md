---
name: multi-agent-brainstorming
description: >
  Orchestrates sequential multi-agent design review w/ strict,
  non-overlapping roles. Prevents blind spots, false confidence,
  & premature convergence. Use for high-confidence designs,
  risk reduction, or formal review.
---

# Multi-Agent Brainstorming (Structured Design Review)

## Purpose

Transform single-agent design into **robust, review-validated design**
via formal peer-review w/ multiple constrained agents.

Goals:
- Surface hidden assumptions
- Identify failure modes early
- Validate non-fn constraints
- Stress-test before impl
- Prevent idea swarm chaos

**Not parallel brainstorming.** Sequential design review w/ enforced roles.

---

## Operating Model

- One agent designs, others review
- No agent may exceed its mandate
- Creativity centralized; critique distributed
- Decisions explicit & logged
- Process **gated** & **terminates by design**

---

## Agent Roles (Non-Negotiable)

Each agent has **hard scope limit**.

### 1. Primary Designer (Lead)

**Role:** Owns design, runs `brainstorming` skill, maintains Decision Log

**May:** Ask clarifications, propose designs/alternatives, revise on feedback

**May NOT:** Self-approve final design, ignore objections, invent reqs post-lock

---

### 2. Skeptic / Challenger

**Role:** Assume design will fail, identify weaknesses & risks

**May:** Question assumptions, identify edge cases, highlight ambiguity/overconfidence, flag YAGNI

**May NOT:** Propose new features, redesign system, offer alt architectures

Prompt: "Assume this design fails in production. Why?"

---

### 3. Constraint Guardian

**Role:** Enforce non-fn & real-world constraints

Focus: performance, scalability, reliability, security/privacy, maintainability, cost

**May:** Reject designs violating constraints, request limit clarification

**May NOT:** Debate product goals, suggest feature changes, optimize beyond stated reqs

---

### 4. User Advocate

**Role:** Represent end user

Focus: cognitive load, usability, flow clarity, error handling (user perspective), intent/experience mismatch

**May:** Identify confusing/misleading aspects, flag poor defaults

**May NOT:** Redesign architecture, add features, override stated user goals

---

### 5. Integrator / Arbiter

**Role:** Resolve conflicts, finalize decisions, enforce exit criteria

**May:** Accept/reject objections, require revisions, declare design complete

**May NOT:** Invent new ideas, add reqs, reopen locked decisions w/o cause

---

## Process

### Phase 1 -- Single-Agent Design

1. Primary Designer runs **standard `brainstorming` skill**
2. Understanding Lock completed & confirmed
3. Initial design produced
4. Decision Log started

No other agents participate yet.

### Phase 2 -- Structured Review Loop

Agents invoked **one at a time**, in order:
1. Skeptic / Challenger
2. Constraint Guardian
3. User Advocate

Per reviewer:
- Feedback explicit & scoped
- Objections must reference assumptions/decisions
- No new features

Primary Designer must: respond to each objection, revise if req, update Decision Log.

### Phase 3 -- Integration & Arbitration

Integrator/Arbiter reviews: final design, Decision Log, unresolved objections.

Arbiter must decide: which objections accepted, which rejected (w/ rationale).

---

## Decision Log (Mandatory)

Must record:
- Decision made
- Alternatives considered
- Objections raised
- Resolution & rationale

No design valid w/o completed log.

---

## Exit Criteria (Hard Stop)

Exit **only when all true**:
- Understanding Lock completed
- All reviewer agents invoked
- All objections resolved | explicitly rejected
- Decision Log complete
- Arbiter declared design acceptable

If any criterion unmet: continue review, do NOT proceed to impl.

If invoked by routing/orchestration layer, MUST report final disposition: APPROVED, REVISE, or REJECT w/ brief rationale.

---

## Failure Modes Prevented

- Idea swarm chaos
- Hallucinated consensus
- Overconfident single-agent designs
- Hidden assumptions
- Premature impl
- Endless debate

---

## Key Principles

- One designer, many reviewers
- Creativity centralized
- Critique constrained
- Decisions explicit
- Process must terminate

---

## Final Reminder

> "If this design fails, did we do everything reasonable to catch it early?"

If answer unclear, **do not exit this skill**.
