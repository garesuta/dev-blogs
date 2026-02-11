---
name: using-git-worktrees
description: Creates isolated git worktrees w/ smart dir selection & safety verification. Use when starting feature work needing isolation from current workspace or before executing impl plans.
---

# Using Git Worktrees

## Overview

Git worktrees create isolated workspaces sharing same repo, allowing work on multiple branches simultaneously w/o switching.

**Core:** Systematic dir selection + safety verification = reliable isolation.

**Announce at start:** "I'm using the using-git-worktrees skill to set up an isolated workspace."

## Dir Selection Process

Priority order:

### 1. Check Existing Dirs

```bash
# Check in priority order
ls -d .worktrees 2>/dev/null     # Preferred (hidden)
ls -d worktrees 2>/dev/null      # Alternative
```

**If found:** Use that dir. If both exist, `.worktrees` wins.

### 2. Check CLAUDE.md

```bash
grep -i "worktree.*director" CLAUDE.md 2>/dev/null
```

**If preference specified:** Use it w/o asking.

### 3. Ask User

If no dir exists & no CLAUDE.md preference:

```
No worktree directory found. Where should I create worktrees?

1. .worktrees/ (project-local, hidden)
2. ~/.config/superpowers/worktrees/<project-name>/ (global location)

Which would you prefer?
```

## Safety Verification

### Project-Local Dirs (.worktrees | worktrees)

**MUST verify dir is ignored before creating worktree:**

```bash
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

**If NOT ignored:**
1. Add line to .gitignore
2. Commit the change
3. Proceed w/ worktree creation

**Why critical:** Prevents accidentally committing worktree contents to repo.

### Global Dir (~/.config/superpowers/worktrees)

No .gitignore verification needed -- outside project.

## Creation Steps

### 1. Detect Project Name

```bash
project=$(basename "$(git rev-parse --show-toplevel)")
```

### 2. Create Worktree

```bash
case $LOCATION in
  .worktrees|worktrees)
    path="$LOCATION/$BRANCH_NAME"
    ;;
  ~/.config/superpowers/worktrees/*)
    path="~/.config/superpowers/worktrees/$project/$BRANCH_NAME"
    ;;
esac

git worktree add "$path" -b "$BRANCH_NAME"
cd "$path"
```

### 3. Run Project Setup

Auto-detect & run:

```bash
# Node.js
if [ -f package.json ]; then npm install; fi

# Rust
if [ -f Cargo.toml ]; then cargo build; fi

# Python
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
if [ -f pyproject.toml ]; then poetry install; fi

# Go
if [ -f go.mod ]; then go mod download; fi
```

### 4. Verify Clean Baseline

Run tests to ensure worktree starts clean:

```bash
npm test
cargo test
pytest
go test ./...
```

**Tests fail:** Report failures, ask whether to proceed.
**Tests pass:** Report ready.

### 5. Report Location

```
Worktree ready at <full-path>
Tests passing (<N> tests, 0 failures)
Ready to implement <feature-name>
```

## Quick Reference

| Situation | Action |
|-----------|--------|
| `.worktrees/` exists | Use it (verify ignored) |
| `worktrees/` exists | Use it (verify ignored) |
| Both exist | Use `.worktrees/` |
| Neither exists | Check CLAUDE.md -> Ask user |
| Dir not ignored | Add to .gitignore + commit |
| Tests fail at baseline | Report failures + ask |
| No package.json/Cargo.toml | Skip dep install |

## Common Mistakes

**Skipping ignore verification** -- Worktree contents get tracked, pollute git status. Always `git check-ignore` before creating project-local worktree.

**Assuming dir location** -- Creates inconsistency. Follow priority: existing > CLAUDE.md > ask.

**Proceeding w/ failing tests** -- Can't distinguish new bugs from pre-existing. Report failures, get explicit permission.

**Hardcoding setup commands** -- Breaks on projects using different tools. Auto-detect from project files.

## Red Flags

**Never:**
- Create worktree w/o verifying it's ignored (project-local)
- Skip baseline test verification
- Proceed w/ failing tests w/o asking
- Assume dir location when ambiguous
- Skip CLAUDE.md check

**Always:**
- Follow dir priority: existing > CLAUDE.md > ask
- Verify dir is ignored for project-local
- Auto-detect & run project setup
- Verify clean test baseline

## Integration

**Called by:** brainstorming (Phase 4), subagent-driven-development, executing-plans, any skill needing isolated workspace

**Pairs with:** finishing-a-development-branch (cleanup after work complete)
