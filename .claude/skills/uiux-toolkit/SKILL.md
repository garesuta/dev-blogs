---
name: uiux-toolkit
description: Comprehensive UX/UI evaluation meta-skill. Use for UI/UX audits, visual design reviews, a11y compliance (WCAG 2.2), user flow analysis, responsive testing, interaction design eval, or design system audits. Evaluates via Nielsen's heuristics, Gestalt principles, typography/color theory & modern methodologies (OOUX, JTBD, Cognitive Walkthrough).
---

# UI/UX Toolkit

Professional UX/UI evaluation across 9 domains. Combines design theory w/ UX methodology. Framework-agnostic for web, mobile & desktop.

## Audit Type Selection

| Need | Load |
|------|------|
| Full UX Audit | ALL references |
| Visual Design | visual-design.md + interaction-review.md |
| Accessibility | accessibility-inspector.md |
| Usability | heuristic-audit.md + user-flow-analysis.md |
| Responsive/Mobile | responsive-behavior.md |
| Design System | design-system-audit.md |
| Content | content-ux-audit.md |
| AI Interface | ai-ux-patterns.md |
| Privacy/Ethics | privacy-ethics-audit.md |

## Sub-Workflows

| Domain | Reference | Purpose |
|--------|-----------|---------|
| Visual | `references/visual-design.md` | Hierarchy, typography, color, Gestalt, spacing |
| Heuristic | `references/heuristic-audit.md` | Nielsen's 10 + modern methods |
| A11Y | `references/accessibility-inspector.md` | WCAG 2.2 AA/AAA, keyboard, screen readers |
| Flow | `references/user-flow-analysis.md` | Task paths, friction, cognitive load |
| Responsive | `references/responsive-behavior.md` | Breakpoints, touch, RTL/LTR, PWA |
| Interactions | `references/interaction-review.md` | Micro-interactions, animations, feedback |
| Design System | `references/design-system-audit.md` | Token consistency, component audit |
| Content | `references/content-ux-audit.md` | UX writing, readability, voice & tone |
| AI/ML | `references/ai-ux-patterns.md` | Explainability, trust, error handling |
| Privacy | `references/privacy-ethics-audit.md` | Dark patterns, consent, GDPR/DSA |

## Quick Start

### 1. Define Scope

```
Audit Scope:
├── Screens: [target screens]
├── Flows: [primary tasks, conversion paths]
├── Platform: [Web/iOS/Android/Desktop/All]
├── WCAG: [A/AA/AAA]
└── Focus: [Visual/A11Y/Usability/Perf]
```

### 2. Select Type

| Type | Refs | Coverage |
|------|------|----------|
| Quick Visual | visual-design.md | Design theory |
| Quick A11Y | accessibility-inspector.md | Automated + keyboard |
| Heuristic | heuristic-audit.md | Nielsen's 10 |
| Full | All 9 refs | Complete eval |
| Focused | 2-3 refs | Targeted review |

### 3. Execute

Each ref contains checklists w/ pass/fail criteria, severity & remediation.

## Severity

| Level | Impact | Action |
|-------|--------|--------|
| Critical | Blocks task/access | Fix immediately |
| Major | >50% users affected | Fix before release |
| Minor | <50% users affected | Next sprint |
| Enhancement | Polish/delight | Backlog |

### Priority Matrix

```
         HIGH FREQ
            |
    +-------+-------+
    | MAJOR | CRIT  |
    | (P1)  | (P0)  |
LOW +-------+-------+ HIGH
IMP | ENH   | MINOR | IMP
    | (P3)  | (P2)  |
    +-------+-------+
         LOW FREQ
```

### Effort

| Level | Examples |
|-------|----------|
| Low | CSS fix, alt text, label |
| Med | Component refactor, validation |
| High | Nav restructure, focus mgmt |

## Quick Checklist

```
[ ] Hierarchy    -> Importance clear? (Squint test)
[ ] Typography   -> Readable, scale, max 2-3 fonts?
[ ] Color        -> Contrast, semantic, 60-30-10?
[ ] Spacing      -> 8pt grid, consistent rhythm?
[ ] Gestalt      -> Items grouped logically?
[ ] Usability    -> Actions discoverable, feedback clear?
[ ] A11Y         -> WCAG AA, keyboard, screen reader?
[ ] Consistency  -> Design system followed?
[ ] Content      -> Clear, scannable, actionable?
[ ] Responsive   -> All breakpoints, touch-friendly?
```

## Scoring

| Grade | Criteria |
|-------|----------|
| A | Professional, polished, accessible, delightful |
| B | Solid fundamentals, minor refinements |
| C | Functional w/ notable issues |
| D | Usable w/ significant problems |
| F | Major usability/a11y failures |

## Output Format

```markdown
## UX Eval: [Component/Page]

### Scope
- Platform: [Web/iOS/Android]
- WCAG: [AA/AAA]
- Domains: [List]

### Assessment
[1-2 sentence summary + grade A-F]

### Critical (P0)
- **[Issue]**: [Desc]
  - *Principle*: [violated]
  - *Fix*: [rec]
  - *Effort*: [L/M/H]

### Major (P1) / Minor (P2) / Enhancements (P3)
[Same format]

### Strengths
- [What works]

### Priority Actions
1. [Top fix]
2. [Second]
3. [Third]
```

## Anti-Patterns

| Pattern | Category | Sev |
|---------|----------|-----|
| Confirm-shaming | Dark | Crit |
| Hidden costs | Dark | Crit |
| Keyboard traps | A11Y | Crit |
| No loading feedback | Visibility | Major |
| Color-only indicators | A11Y | Major |
| Auto-play video+sound | Attention | Major |
| Infinite scroll w/o footer | Nav | Minor |

## Methodologies

| Method | Focus | Use |
|--------|-------|-----|
| Cognitive Walkthrough | Task completion | Complex flows |
| OOUX | Object-noun consistency | IA |
| JTBD | Job stories | Feature validation |
| Gestalt | Visual grouping | Layout |
| Baymard | E-commerce | Shopping flows |

## Platform Testing

| Platform | Auto | Manual |
|----------|------|--------|
| Web | axe-core, Lighthouse | DevTools, keyboard |
| iOS | Accessibility Inspector | VoiceOver |
| Android | Accessibility Scanner | TalkBack |
| Design | Stark, Contrast plugins | Review |

---

Load `references/*.md` for detailed checklists & criteria.
