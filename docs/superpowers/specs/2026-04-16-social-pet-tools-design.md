# Social Pet Tools Design

## Goal

Create a new aggregate skill named `social-pet-tools` that acts as the single routing entry for all existing `social-pet-*` skills in this workspace.

The design must satisfy these constraints:

- Keep all existing `social-pet-*` skill directories unchanged for backward compatibility.
- Introduce a new command-oriented structure under `skills/social-pet-tools/`.
- Route user intent through a main `SKILL.md`, with actionable content stored in `commands/*.md`.
- Cover all current `social-pet-*` items in the folder, including `social-pet-oncall`.
- Support implementation with parallel sub-agents by splitting the work into independent file groups.

## Current State

Existing relevant directories under `skills/`:

- `social-pet-config-modify/`
- `social-pet-local-test/`
- `social-pet-oncall/`
- `social-pet-rpc-acceptance-loop/`
- `social-pet-rpc-pod-triage/`
- `social-pet-rpc-verify-loop/`

Observed patterns:

- `social-pet-config-modify/` already uses a command-oriented layout with `commands/`.
- `social-pet-local-test/`, `social-pet-rpc-pod-triage/`, and `social-pet-rpc-verify-loop/` are standalone skills with substantial procedure content in `SKILL.md`.
- `social-pet-rpc-acceptance-loop/` is command-like in spirit but not normalized into the aggregate entry format.
- `social-pet-oncall/` currently has an empty `SKILL.md`, so the aggregate design must include a placeholder command contract for future fill-in rather than inventing unsupported behavior.
- Mature router skills in this workspace, such as `obsidian-tools/` and `bytedance-tools/`, follow a stable pattern: main router in `SKILL.md`, operational documents in `commands/`, shared conventions in `references/`.

## Chosen Approach

Recommended approach: create a new aggregate skill `skills/social-pet-tools/` and leave existing skill directories intact.

Why this approach:

- Preserves all current entry points and user muscle memory.
- Avoids risky edits to already-working skills.
- Matches the workspace convention of a router skill delegating into `commands/`.
- Makes later expansion easier, because new social-pet capabilities can be added as new command files without restructuring legacy skills.

Rejected alternatives:

1. Convert each existing `social-pet-*` directory in place to `commands/` structure.
   - Rejected because it changes original skills and violates the user requirement.
2. Put all social-pet content into one oversized `SKILL.md`.
   - Rejected because it does not produce a clean command-oriented router design.

## Target Structure

```text
skills/social-pet-tools/
├── SKILL.md
├── commands/
│   ├── config-modify.md
│   ├── local-test.md
│   ├── oncall.md
│   ├── rpc-acceptance.md
│   ├── rpc-pod-triage.md
│   └── rpc-verify.md
└── references/
    ├── conventions.md
    └── mapping.md
```

## Command Mapping

The aggregate command files map to existing skills like this:

| Aggregate command | Source skill |
|---|---|
| `config-modify` | `social-pet-config-modify` |
| `local-test` | `social-pet-local-test` |
| `oncall` | `social-pet-oncall` |
| `rpc-acceptance` | `social-pet-rpc-acceptance-loop` |
| `rpc-pod-triage` | `social-pet-rpc-pod-triage` |
| `rpc-verify` | `social-pet-rpc-verify-loop` |

Naming choice:

- Use short, stable command names in `social-pet-tools/commands/`.
- Preserve the longer legacy names only in the mapping and compatibility notes.

## Router Design

`skills/social-pet-tools/SKILL.md` will serve as the only routing document and must contain:

1. Frontmatter
   - `name: social-pet-tools`
   - A concise description stating what the skill does and when to invoke it.
2. Scope
   - Only for `social_pet` repository and adjacent social-pet operational workflows.
3. Directory structure
   - Explain `commands/` and `references/`.
4. Command routing table
   - Explicit command forms and semantic-intent routing.
5. Global execution rules
   - Keep repository-specific constraints centralized instead of repeating them in every command.
6. Loading rule
   - Read router first, then only load the selected `commands/*.md`, plus referenced docs as needed.

### Explicit routing

The router should support direct command forms such as:

- `local-test`
- `config-modify`
- `rpc-acceptance`
- `rpc-pod-triage`
- `rpc-verify`
- `oncall`

### Semantic routing

The router should also map natural-language requests, for example:

- "跑一下 social_pet 本地单测" -> `local-test`
- "帮我改 ppe 的 social_pet 配置" -> `config-modify`
- "帮我做一轮 RPC 黑盒验收" -> `rpc-acceptance`
- "按 pod 日志链路排查这次请求" -> `rpc-pod-triage`
- "改完代码后帮我继续 RPC 验证" -> `rpc-verify`
- "处理 social-pet oncall 事务" -> `oncall`

## Shared References

Two shared reference files will be introduced.

### `references/conventions.md`

Purpose:

- Record cross-command conventions once and let command files reference them.

Expected content:

- Repository scope: `social_pet`
- Command-first loading rule
- Keep evidence on disk for long workflows
- Default response language: Chinese for human-facing summaries
- Prefer minimal changes and clear evidence
- Local testing note: when the task requires repository-native testing, follow the local flow described by the existing `social-pet-local-test` capability
- Do not invent unsupported procedures for empty or unfinished subdomains

### `references/mapping.md`

Purpose:

- Explain how the new aggregate command set maps to legacy skills.

Expected content:

- One-to-one mapping table
- Backward compatibility note
- Guidance that old skills remain valid but new work should prefer `social-pet-tools`

## Command File Design

Each file in `commands/` should be a focused operational entry with:

- Trigger phrases
- Goal
- Inputs required
- Execution steps
- Output expectations
- Common mistakes or stop conditions
- References back to the source skill when the source contains deeper procedures or templates

### `commands/local-test.md`

Source: `social-pet-local-test`

Responsibilities:

- Normalize the local `build.sh` plus `ci/run.sh` flow into command form.
- Keep the rule that success is based on evidence in logs, not only exit code.
- Keep examples and recommended reporting structure concise.

### `commands/config-modify.md`

Source: `social-pet-config-modify`

Responsibilities:

- Re-express the existing config workflow under the aggregate namespace.
- Keep fixed directory, `svn update`, minimal diff, `svn commit`, and Lark copywriting constraints.
- Avoid duplicating every detail already well captured in the legacy source unless needed for command usability.

### `commands/rpc-acceptance.md`

Source: `social-pet-rpc-acceptance-loop`

Responsibilities:

- Represent full acceptance execution as a command.
- Preserve the phase model, artifact layout, retry policy, and hard gate before code changes.
- Keep the "run all planned cases before business-code modification" rule explicit.

### `commands/rpc-pod-triage.md`

Source: `social-pet-rpc-pod-triage`

Responsibilities:

- Preserve the single-request triage chain.
- Keep the order: request -> raw response -> `log_id/pod_name` -> instance logs -> external state.
- Retain the distinction from full acceptance or local testing.

### `commands/rpc-verify.md`

Source: `social-pet-rpc-verify-loop`

Responsibilities:

- Preserve the fix-test-rpc-verify loop for post-change verification.
- Keep repository-native local testing as a prerequisite.
- Keep artifact/report persistence and minimum request-body construction rules.

### `commands/oncall.md`

Source: `social-pet-oncall`

Responsibilities:

- Provide a safe placeholder command entry because the legacy source is currently empty.
- State that oncall handling belongs here when the user explicitly requests social-pet operational incident support.
- State that concrete workflows must be confirmed from repository context or future documentation.
- Avoid fabricating step-by-step operational procedures that do not yet exist in the source material.

## Non-Goals

This work does not:

- Modify or delete any existing `social-pet-*` skill.
- Rename existing legacy skill directories.
- Fill in detailed `social-pet-oncall` operational runbooks without source material.
- Merge templates or refs from legacy skills unless required by the new aggregate docs.

## Parallel Implementation Plan

The implementation can be split into independent sub-agent tasks:

1. Router track
   - Create `social-pet-tools/SKILL.md`
   - Create `references/conventions.md`
   - Create `references/mapping.md`
2. Operational track A
   - Create `commands/local-test.md`
   - Create `commands/config-modify.md`
   - Create `commands/oncall.md`
3. Operational track B
   - Create `commands/rpc-acceptance.md`
   - Create `commands/rpc-pod-triage.md`
   - Create `commands/rpc-verify.md`

These tracks are independent because they write different files.

## Risks And Mitigations

### Risk: content drift from legacy skills

Mitigation:

- Use the legacy skill text as the source of truth.
- Keep the new command docs as reorganized guidance, not behavioral reinvention.

### Risk: over-specifying `oncall`

Mitigation:

- Keep `oncall.md` deliberately scoped as a placeholder command contract.
- Mark missing workflow details as future fill-in, not current behavior.

### Risk: inconsistent command naming

Mitigation:

- Standardize on short command names in the aggregate skill.
- Document the mapping from aggregate names to legacy names in one place.

## Validation

After implementation, validate:

1. `skills/social-pet-tools/` exists with `SKILL.md`, `commands/`, and `references/`.
2. The router description clearly states when to invoke `social-pet-tools`.
3. All current `social-pet-*` items are covered by a command file.
4. No legacy skill file is modified.
5. The new docs are internally consistent and use a command-oriented structure similar to established router skills in the workspace.

## Implementation Decision

Proceed with a new aggregate router skill `social-pet-tools`, preserve all legacy skills unchanged, create six command docs, and centralize cross-cutting rules in `references/`.
