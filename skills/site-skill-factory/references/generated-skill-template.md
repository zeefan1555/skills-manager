# Generated Site Skill Template

Use this template when compiling `~/.codex/skills/<site-id>-site/SKILL.md`.

## Frontmatter

```yaml
---
name: <site-id>-site
description: Use when a user wants Codex to operate or extract information from <site name>, including authenticated flows if the site requires login.
---
```

## Recommended Body Structure

```markdown
# <Site Name>

## Overview
One short paragraph describing what this site skill is for.

## When to Use
- Supported task 1
- Supported task 2
- Supported task 3

## Authentication
- State whether the site is public or login-gated
- State how login should be restored or re-established
- State the concrete logged-in success signals

## Core Actions
### <action name>
- Preconditions
- Steps
- Success signals

## Extraction Rules
- What content matters
- Reading order rules
- What to ignore

## Failure Recovery
- What to do if redirected to login
- What to do if selectors change
- What to do if the content is embedded in an iframe

## References
Point to `references/` files for selectors, routes, or large tables.
```

## Rules For Generated Skills

- Keep the main `SKILL.md` operational and concise
- Put selector-heavy details into `references/`
- Do not include build artifact filenames in the final generated skill unless needed for future maintenance
- Do not include sensitive values, credentials, cookies, or copied session material
- Prefer semantic task descriptions over browser-implementation trivia
