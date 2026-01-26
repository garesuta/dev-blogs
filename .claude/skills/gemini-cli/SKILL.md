---
name: gemini-cli
description: Run Gemini CLI for AI queries with token-optimized context transfer. Use when user asks to "run/ask/use gemini", compare Claude vs Gemini, or delegate tasks to Gemini.
---

# Gemini CLI

Interact w/ Google's Gemini CLI locally w/ compressed context transfer.

## Prerequisites

Gemini CLI must be installed & configured:
1. **Install:** https://github.com/google-gemini/gemini-cli
2. **Auth:** Run `gemini` & sign in w/ Google account
3. **Verify:** `gemini --version`

## When to Use

- User asks to "run/ask/use gemini"
- Compare Claude vs Gemini responses
- Get second AI opinion
- Delegate task to Gemini

## Context Transfer Workflow

**REQUIRED:** Before sending any context to Gemini:

1. **Read prompt-compressor skill:**
```
   Use `.claude/skills/prompt-compressor/SKILL.md`
```

2. **Compress the context** using the skill's methodology

3. **Execute with compressed prompt:**
```bash
   gemini "COMPRESSED_PROMPT_HERE"
```

## Usage
```bash
# One-shot query (compress first)
gemini "Your compressed prompt"

# Specific model
gemini -m gemini-3-pro-preview "prompt"

# JSON output
gemini -o json "prompt"

# YOLO mode (auto-approve)
gemini -y "prompt"

# File analysis (compress file content first)
COMPRESSED=$(compress_content < file.txt)
echo "$COMPRESSED" | gemini "Analyze this"
```

## Comparison Workflow

| Step | Action |
|------|--------|
| 1 | Compress the query using prompt-compressor |
| 2 | Provide Claude's response |
| 3 | Run compressed query via Gemini CLI |
| 4 | Present both for comparison |

## CLI Options

| Flag | Desc |
|------|------|
| `-m` | Model (gemini-3-pro) |
| `-o` | Output: text/json/stream-json |
| `-y` | Auto-approve (YOLO) |
| `-d` | Debug mode |
| `-s` | Sandbox mode |
| `-r` | Resume session |
| `-i` | Interactive after prompt |

## Best Practices

- **Always compress** prompts before sending to Gemini
- Quote prompts w/ double quotes
- Use `-o json` for parsing
- Pipe compressed files for context
- Specify model for specific capabilities

## Anti-Patterns (AVOID)

| Don't | Do Instead |
|-------|------------|
| Send raw context to Gemini | Compress using prompt-compressor first |
| Skip compression for "small" prompts | Always compress—small savings add up |
| Ignore compression ratio | Log reduction % for optimization |