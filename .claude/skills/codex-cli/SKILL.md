---
name: codex-cli
description: Run OpenAI Codex CLI for coding tasks & second-opinion audits. Use when user asks to run/ask/use Codex, says "codex prompt", or wants to delegate logic/code review to OpenAI models.
---

# Codex CLI

Run OpenAI Codex CLI locally for second-opinion audits, code review & non-interactive task execution.

## Prerequisites

1. **Install:** `npm install -g @openai/codex`
2. **Auth:** `codex login`
3. **Verify:** `codex --version`

## Core Execution Pattern

Use `codex exec` for delegated prompts (non-interactive):

```bash
codex exec "Your prompt here"
```

When user says "codex prompt", treat as:
```bash
codex exec "<user prompt>"
```

## Model Guidance

Use def configured model unless user asks otherwise. Latest tested:

```bash
codex exec -m gpt-5.3-codex "Your prompt"
```

Compatibility:
- `gpt-5-codex` may fail if config uses `model_reasoning_effort = "xhigh"`
- Workaround: set reasoning effort explicitly:
```bash
codex exec -m gpt-5-codex -c model_reasoning_effort="high" "Your prompt"
```

## Commands

### Non-Interactive Execution

```bash
# Basic task
codex exec "Audit this logic for edge cases"

# Explicit model
codex exec -m gpt-5.3-codex "Review this implementation strategy"

# Full-auto mode (sandboxed)
codex exec --full-auto "Implement the requested refactor"

# Read-only sandbox (analysis only)
codex exec -s read-only "Find bugs in this code path"

# Workspace-write sandbox
codex exec -s workspace-write "Apply the fix and update tests"

# Custom working dir
codex exec -C /path/to/project "Evaluate this repository"

# Save output to file
codex exec -o output.txt "Summarize key risks"

# JSONL event stream
codex exec --json "Produce structured findings"

# Pipe context from stdin
cat context.txt | codex exec -
```

### Code Review

```bash
# Review uncommitted changes
codex review --uncommitted

# Review against base branch
codex review --base main

# Review specific commit
codex review --commit abc123

# Custom review instructions
codex review "Focus on security issues"

# Combined
codex review --base main "Check for performance regressions"
```

## Flag Placement

`--search` & `-a/--ask-for-approval` are top-level flags. Put them **before** `exec` | `review`.

Correct:
```bash
codex --search -a on-request exec "Your prompt"
codex --search -a on-request review --uncommitted
```

Wrong:
```bash
codex exec --search "Your prompt"
codex exec -a on-request "Your prompt"
```

## Useful Flags

| Flag | Desc |
|------|------|
| `-m` | Model (e.g. `gpt-5.3-codex`) |
| `-s` | Sandbox: `read-only`, `workspace-write`, `danger-full-access` |
| `-a` | Approval policy (`untrusted`, `on-failure`, `on-request`, `never`) -- top-level |
| `-C` | Working dir |
| `-o` | Write last message to file |
| `--full-auto` | Sandboxed auto-execution (`-a on-request -s workspace-write`) |
| `--json` | JSONL event output |
| `--search` | Enable web search -- top-level |
| `--add-dir` | Additional writable dirs |
| `-c key=value` | Override config (e.g. `-c model_reasoning_effort="high"`) |

## Best Practices

- Prefer `codex exec` for delegated prompts over interactive `codex`
- Start w/ `-s read-only` for audits & second opinions
- Use `--full-auto` only when expecting autonomous edits
- Keep prompts explicit about expected output format
- Add `-o` when another tool/agent must consume result
- Run `codex review --uncommitted` before committing as quick extra pass
