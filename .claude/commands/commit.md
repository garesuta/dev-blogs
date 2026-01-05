---
name: commit
description: Commit using my current git profile
tools:
  - Bash(git config user.name)
  - Bash(git config user.email)
  - Bash(git status)
  - Bash(git diff *)
  - Bash(git add .)
  - Bash(git commit -m *)
  - Bash(git log --oneline -1)
---

# Auto Commit Workflow

Execute this workflow:

1. **Read current profile**:
    - Run `git config user.name`
    - Run `git config user.email`
    - Show me who will be committing

2. **Analyze changes**:
    - Run `git status` and `git diff`
    - Summarize what files changed and why

3. **Stage all changes**:
    - Run `git add .`
    - Run `git status` again to verify all files are staged
    - If you see "Untracked files" or "Changes not staged for commit":
        * Run `git add .` again
        * Confirm all files are now staged

4. **Create commit message**:
   Show the proposed message in this format:

```
   <type>: <brief summary>
   
   - Change 1: description
   - Change 2: description
   - Change 3: description
```

5. **ASK FOR APPROVAL**:
   Stop here and ask: "Approve this commit? (yes/no)"
   WAIT for my response before proceeding.

6. **If approved, commit**:
    - Run `git commit -m "message"`
    - Show: "✓ Committed as [name] <[email]>"
    - Show the commit hash from git log

Types: feat, fix, docs, style, refactor, test, chore

IMPORTANT:

- Always wait for my approval before running git commit
- Always check for unstaged files before committing and re-run git add . if needed
- Never add Claude Code footers or co-author tags to commit messages
