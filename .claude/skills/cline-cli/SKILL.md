---
name: cline-cli
description: Run Cline CLI for AI coding tasks w/ token-optimized context transfer. Use when user asks to "run/ask/use cline", compare Claude Code vs Cline, delegate tasks, or get second AI opinion.
---

# Cline CLI

Interact w/ Cline's CLI locally w/ compressed context transfer.

## Prerequisites

1. **Install:** `npm install -g cline`
2. **Auth:** `cline auth`
3. **Verify:** `cline --version`

## When to Use

- User asks to "run/ask/use cline"
- Compare Claude Code vs Cline responses
- Get second AI opinion on code
- Delegate coding task to Cline
- Run autonomous agent for file edits, test fixes, or refactors

## Context Transfer Workflow

**REQ:** Before sending context to Cline:

1. Read prompt-compressor skill: `.claude/skills/prompt-compressor/SKILL.md`
2. Compress context using skill's methodology
3. Execute w/ compressed prompt:
```bash
cline -y "COMPRESSED_PROMPT_HERE"
```

## Usage

```bash
# Interactive mode
cline
cline "Help me refactor this codebase"

# Headless one-shot (compress first)
cline -y "Your compressed prompt"

# Plan mode (review strategy before acting)
cline -p "Design a caching layer for the API"

# Act mode (execute immediately)
cline -a "Fix all ESLint errors in src/"

# JSON output for parsing
cline --json "List all TODO comments" | jq '.text'

# Piped file context (compress first)
cat file.py | cline "Review this code"
cat src/*.py | cline -y "Find bugs in this codebase"

# Specific model
cline -m gpt-4o "prompt"

# With timeout (seconds)
cline -y --timeout 600 "Run the full test suite"

# Chain commands
git diff | cline -y "explain these changes" | cline -y "write a commit message"

# Browse task history
cline history
cline history -n 20
```

## Comparison Workflow

| Step | Action |
|------|--------|
| 1 | Compress query using prompt-compressor |
| 2 | Provide Claude Code's response |
| 3 | Run compressed query via Cline CLI |
| 4 | Present both for comparison |

## CLI Options

| Flag | Desc |
|------|------|
| `-y`, `--yolo` | Auto-approve all actions (headless) |
| `-p`, `--plan` | Plan mode (review before acting) |
| `-a`, `--act` | Act mode (execute immediately) |
| `-m`, `--model` | Specify model |
| `--json` | JSON output for scripting |
| `--timeout` | Timeout in seconds |
| `--config` | Path to config file |
| `--version` | Show version |

## Mode Detection

| Invocation | Mode | Reason |
|------------|------|--------|
| `cline` | Interactive | No args, TTY connected |
| `cline "task"` | Interactive | TTY connected |
| `cline -y "task"` | Headless | YOLO flag |
| `cline --json "task"` | Headless | JSON flag |
| `cat file \| cline "task"` | Headless | stdin piped |
| `cline "task" > out.txt` | Headless | stdout redirected |

## Command Permissions

```bash
# Allow only npm & git
export CLINE_COMMAND_PERMISSIONS='{"allow": ["npm *", "git *"]}'

# Allow dev commands, deny dangerous
export CLINE_COMMAND_PERMISSIONS='{"allow": ["npm *", "git *", "node *"], "deny": ["rm -rf *", "sudo *"]}'
```

## Subcommands

```bash
cline auth                                    # Interactive wizard
cline auth -p anthropic -k KEY -m MODEL       # Quick setup
cline history                                 # Recent tasks (def: 10)
cline history -n 20                           # More tasks
cline history -n 10 -p 2                      # Paginate
cline dev log                                 # View debug logs
```

## Best Practices

- **Always compress** prompts before sending
- `-y` (YOLO) for scripted/automated usage
- `-p` (Plan) to review strategy before execution
- `--json` for parsing responses programmatically
- `--timeout` in CI/CD to prevent runaway tasks
- Run on clean git branch w/ `-y` so changes can be reverted
- Set `CLINE_COMMAND_PERMISSIONS` for safe automated runs

## Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| Send raw context | Compress using prompt-compressor first |
| Skip compression for "small" prompts | Always compress -- savings add up |
| Ignore compression ratio | Log reduction % for optimization |
| Use `-y` on main w/o review | Run on feature branch | use Plan mode first |
| Run w/o timeout in CI/CD | Use `--timeout` to bound execution |
