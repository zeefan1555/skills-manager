## Context
The `social-pet-tools` skill routes multiple operational workflows for `social_pet`. The `tcc` command is the entry point for modifying and publishing TCC configs via `bytedcli`.

This change is based on a recently successful TCC update/deploy in `ppe_tab_template` for `ttgame.social.pet/WidgetConfig`, which exposed documentation drift and missing copy-pastable templates.

## Problems Observed
1. Flag naming drift:
   - Existing docs refer to `tcc-site` / `--tcc-site`, but `bytedcli tcc update-config` exposes global `--site` (ByteCloud site: `cn|boe|i18n-bd|...`).
   - Users may confuse "prod" (publish target env) with "prod site" (not a `--site` value); this causes wrong commands and wasted retries.
2. Command shape drift:
   - Some docs use `tcc config get`, while the verified path uses `tcc get-config`.
3. Missing success template:
   - The reliable workflow is "get -> persist before -> minimal change (dedupe append) -> update -> deploy -> verify get", but the `tcc` command doc does not provide a complete, reusable snippet set.

## Goals
- Make `social-pet-tools/commands/tcc.md` accurately reflect `bytedcli` CLI surface:
  - Use `--site` (not `--tcc-site`) when referring to ByteCloud site selection.
  - Use `tcc get-config` / `tcc update-config` / `tcc deploy-config` command forms consistent with current `bytedcli`.
- Add a copy-pastable "successful loop" template:
  - Evidence files written to `/tmp` (or similar) for `get`, `update`, `deploy`, and a normalized `before/after` base.
  - A small Python snippet to implement "append string to JSON list with de-duplication" while keeping other fields unchanged.
- Keep scope minimal: update only the aggregate entry doc `social-pet-tools/commands/tcc.md`.

## Non-Goals
- Do not modify legacy skills (e.g., `social-pet-config-modify`) or other command docs.
- Do not invent new operational SOP beyond what is needed for correctness and reusability.
- Do not add new scripts/binaries to the repo; only provide inline snippets in the doc.

## Proposed Changes (Document Content)
1. Terminology normalization:
   - Define:
     - `env`: TCC env (e.g., `ppe_tab_template`, `ppe_xxx`, `prod`)
     - `site`: ByteCloud site (CLI global flag `--site`, usually `cn` for `cloud.bytedance.net`)
   - Remove/avoid `tcc-site` wording (or explicitly mark it as historical/colloquial).
2. Verified command templates:
   - `auth status` (optional)
   - `tcc list-sites`
   - `tcc get-config <namespace> <config_name> --env ... --region ... --dir ... [--site ...]`
   - `tcc update-config ... --file <after.json> --note ... [--site ...]`
   - `tcc deploy-config ... --region ... [--site ...]`
3. Evidence layout:
   - Recommended paths:
     - `/tmp/tcc_<config>_<env>_get.json`
     - `/tmp/tcc_<config>_<env>_before_base.json`
     - `/tmp/tcc_<config>_<env>_after_base.json`
     - `/tmp/tcc_<config>_<env>_update.json`
     - `/tmp/tcc_<config>_<env>_deploy.json`
4. Minimal-change snippet:
   - Python snippet:
     - Parses `latest_version.base` JSON.
     - Ensures `check_white_list` is a list of strings.
     - Appends with de-duplication.
     - Writes `before/after` normalized JSON to disk for review and rollback.

## Success Criteria
- A user can follow `social-pet-tools/commands/tcc.md` verbatim to:
  - Read current config and persist evidence.
  - Apply a minimal change to a JSON list field safely.
  - Update and deploy the config.
  - Verify that `online_version` reflects the new version/value.
- The doc no longer suggests unsupported flags (`--tcc-site`) for `update-config/deploy-config`.

## Risks and Mitigations
- Risk: `bytedcli` flags change again.
  - Mitigation: keep the doc grounded in "verify with `--help`" and avoid over-specifying optional flags.
- Risk: Users confuse `env=prod` with `--site`.
  - Mitigation: highlight the difference in the terminology section and default `--site cn` unless explicitly overridden.

