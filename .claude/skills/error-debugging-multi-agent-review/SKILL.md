---
name: error-debugging-multi-agent-review
description: "Multi-agent code review orchestration"
---

# Multi-Agent Code Review Orchestration

## Use When
- Multi-agent code review tasks
- Detailed examples: open `resources/implementation-playbook.md`

## Instructions
1. Clarify goals, constraints, inputs
2. Apply best practices, validate outcomes
3. Provide actionable steps & verification

## Agent Types
1. Code Quality Reviewers
2. Security Auditors
3. Architecture Specialists
4. Performance Analysts
5. Compliance Validators

## Coordination Strategy

### 1. Agent Selection & Routing
Analyze input -> select appropriate agents dynamically:
```python
def route_agents(code_context):
    agents = []
    if is_web_application(code_context):
        agents.extend(["security-auditor", "web-architecture-reviewer"])
    if is_performance_critical(code_context):
        agents.append("performance-analyst")
    return agents
```

### 2. Context Management
Shared context across agents w/ incremental insight refinement:
```python
class ReviewContext:
    def __init__(self, target, metadata):
        self.target = target
        self.metadata = metadata
        self.agent_insights = {}
    def update_insights(self, agent_type, insights):
        self.agent_insights[agent_type] = insights
```

### 3. Execution Strategy
- **Parallel:** Independent reviews (code-quality, security)
- **Sequential:** Dependent insights (architecture -> performance)
- Timeout & fallback mechanisms

### 4. Result Aggregation
Merge insights, resolve conflicts, generate prioritized report:
```python
def synthesize_review_insights(agent_results):
    return {"critical_issues": [], "important_issues": [], "improvement_suggestions": []}
```

### 5. Conflict Resolution
Detect contradictions -> weighted scoring -> escalate complex conflicts.

## Examples

```python
# Parallel review
multi_agent_review(target="/path/to/project", agents=[
    {"type": "security-auditor", "weight": 0.3},
    {"type": "architecture-reviewer", "weight": 0.3},
    {"type": "performance-analyst", "weight": 0.2}
])

# Sequential workflow
[{"phase": "design-review", "agent": "architect-reviewer"},
 {"phase": "implementation-review", "agent": "code-quality-reviewer"},
 {"phase": "testing-review", "agent": "test-coverage-analyst"}]
```

## Best Practices
- Maintain agent independence
- Robust error handling
- Probabilistic routing
- Support incremental reviews

Target: $ARGUMENTS
