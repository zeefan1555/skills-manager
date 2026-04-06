---
name: site-skill-factory
description: Use when a user wants Codex to explore a website and generate a reusable Codex skill for it, including both public sites and sites that require interactive login.
---

# Site Skill Factory

## Overview

Generate a two-layer result:

1. A temporary build workspace with structured site artifacts
2. A final site-specific Codex skill

Do not generate the final skill directly from ad hoc exploration notes. Always produce structured intermediate artifacts first, then compile the final skill from those artifacts.

Default paths:

- Build workspace: `~/.codex/site-skill-factory/<site-id>/`
- Final generated skill: `~/.codex/skills/<site-id>-site/`

Read [artifact-schemas.md](references/artifact-schemas.md) before creating build artifacts.
Read [generated-skill-template.md](references/generated-skill-template.md) before writing the final site-specific skill.

## Workflow

1. Normalize the target into a stable `site-id`
2. Explore the site and identify core user flows
3. Detect whether authentication is required
4. Record structured artifacts
5. Generate a site-specific skill from those artifacts
6. Validate the generated skill with one realistic prompt

## Site ID

Create a stable `site-id` from the domain or product name.

Examples:

- `bytetech.info` -> `bytetech`
- `www.youtube.com` -> `youtube`
- `internal.foo.example.com` -> `foo-example`

Use lowercase letters, numbers, and hyphens only.

## Exploration

Use browser automation first when the site is accessible through the current browser toolchain.

Capture:

- Entry URLs worth keeping
- Main navigation and page types
- Content extraction patterns
- Common actions such as search, open detail, paginate, download, publish, or submit
- Signals that distinguish logged-in vs logged-out states

Do not keep raw notes as the primary output. Convert findings into the structured artifacts immediately.

## Authentication

Support both public and authenticated sites, but keep authentication separate from exploration logic.

Rules:

- Do not export or copy credentials, cookies, or session tokens from the user's personal browser profile
- Do not assume browser automation can reuse the user's daily browser state
- Prefer site-specific automation sessions over the user's primary browser profile
- For authenticated sites, default to `hybrid` auth strategy:
  - restore prior automation session if available
  - otherwise guide one interactive login

Interactive login is acceptable. Extracting the user's personal browser credentials is not.

## Required Build Artifacts

Inside `~/.codex/site-skill-factory/<site-id>/`, create:

- `site-profile.json`
- `auth-strategy.json`
- `action-map.json`
- `skill-spec.md`

These files are the contract between exploration and skill generation. If one of them is missing or weak, the generated skill will be unstable.

## Final Skill Output

Generate the site-specific skill at:

`~/.codex/skills/<site-id>-site/`

Minimum output:

- `SKILL.md`

Optional output:

- `references/`
- `scripts/`

The generated skill should contain only reusable operational guidance for that site. Do not include your exploration narrative, debugging diary, or one-off observations unless they are needed for future operation.

## Validation

After generating the site-specific skill, run one realistic user-style prompt against it.

Example validation prompts:

- "Read the main content from this article URL"
- "Search this site for a keyword and open the first result"
- "Open the dashboard and confirm whether the user is logged in"

If the generated skill fails, update the build artifacts first. Do not patch the final skill blindly unless the root problem is truly in the final wording.

## Heuristics

- Use `public` auth only when the site is fully usable without login
- Use `hybrid` auth by default for login-gated sites
- Prefer semantic actions over selector dumps
- Put heavy selector details and route tables into `references/`, not the main `SKILL.md`
- If the site is highly dynamic, document recovery paths and fallback checks explicitly

## Common Mistakes

- Writing the final skill directly from exploration notes
- Mixing login procedures with content extraction instructions
- Treating one successful page interaction as proof the whole site model is stable
- Embedding fragile selectors in the main skill body when they belong in references
- Designing around the user's personal browser profile instead of a dedicated automation session
