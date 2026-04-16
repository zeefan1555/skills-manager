# Social Pet Tools TCC Doc Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update `social-pet-tools/commands/tcc.md` to match verified `bytedcli` CLI surface and add a copy-pastable success loop template (evidence + minimal JSON edit snippet).

**Architecture:** Documentation-only change. Align terminology (`env` vs ByteCloud `--site`), align command forms (`tcc get-config` etc.), and provide a safe "get -> before/after -> update -> deploy -> verify" workflow.

**Tech Stack:** Markdown; `bytedcli` command examples; inline Python snippet for JSON base edits.

---

### Task 1: Baseline The Current Doc

**Files:**
- Modify: `skills/social-pet-tools/commands/tcc.md`

- [ ] **Step 1: Read the current doc content**
  - Inspect current terms for site selection (`tcc-site` / `--tcc-site`) and command forms (`tcc config get` vs `tcc get-config`).
  - Identify sections to replace vs keep (triggers, boundaries, output checklist are generally stable).

---

### Task 2: Fix Flag/Term Drift (Correctness First)

**Files:**
- Modify: `skills/social-pet-tools/commands/tcc.md`

- [ ] **Step 1: Add a short terminology section near the top**
  - Clarify:
    - `env` = TCC environment, e.g. `ppe_tab_template` / `ppe_xxx` / `prod`
    - `--site` = ByteCloud site (global flag), e.g. `cn` for `cloud.bytedance.net`
  - Explicitly warn against confusing "prod env" with ByteCloud `--site`.

- [ ] **Step 2: Replace references to `tcc-site` with `--site`**
  - Update the "输入" list:
    - Replace `tcc-site` with `site` (CLI `--site`)
  - Update any command templates to use `[--site <site>]` rather than `--tcc-site`.
  - Keep a one-line note: "historically called tcc-site in some docs; actual CLI uses `--site`."

---

### Task 3: Align Command Templates With Verified Bytedcli

**Files:**
- Modify: `skills/social-pet-tools/commands/tcc.md`

- [ ] **Step 1: Update the command prefix block**
  - Standardize on:
    ```bash
    NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json
    ```

- [ ] **Step 2: Update the read/update/deploy templates**
  - Read:
    ```bash
    NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json tcc get-config "<namespace>" "<config_name>" --env "<env>" --region "<region>" --dir "<dir>" [--site "<site>"]
    ```
  - Update (file-based):
    ```bash
    NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json tcc update-config "<namespace>" "<config_name>" --env "<env>" --region "<region>" --dir "<dir>" --file /tmp/tcc_<config>_<env>_after_base.json --note "<note>" [--site "<site>"]
    ```
  - Deploy:
    ```bash
    NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json tcc deploy-config "<namespace>" "<config_name>" --env "<env>" --region "<region>" [--site "<site>"]
    ```
  - Ensure the doc does not claim unsupported flags for these subcommands.

---

### Task 4: Add A Copy-Pastable "Success Loop" Template (Evidence + Minimal Change)

**Files:**
- Modify: `skills/social-pet-tools/commands/tcc.md`

- [ ] **Step 1: Add an evidence layout section**
  - Recommend a consistent set of files (all in `/tmp`):
    - `/tmp/tcc_<config>_<env>_get.json`
    - `/tmp/tcc_<config>_<env>_before_base.json`
    - `/tmp/tcc_<config>_<env>_after_base.json`
    - `/tmp/tcc_<config>_<env>_update.json`
    - `/tmp/tcc_<config>_<env>_deploy.json`

- [ ] **Step 2: Add a minimal-change Python snippet**
  - Provide a snippet that:
    - Loads `/tmp/tcc_<config>_<env>_get.json`
    - Parses `data.latest_version.base` as JSON
    - Ensures a target list field is a list of strings
    - Appends one string with de-duplication
    - Writes normalized `before_base.json` and `after_base.json`
  - The snippet must be safe-by-default and fail fast if the field is not a list.

- [ ] **Step 3: Add an end-to-end example for `WidgetConfig.check_white_list`**
  - Include placeholders for `namespace/config/env/region/dir`
  - Show `get-config` redirection to `/tmp/..._get.json`
  - Show running Python snippet to generate `after_base.json`
  - Show `update-config` redirect to `/tmp/..._update.json`
  - Show `deploy-config` redirect to `/tmp/..._deploy.json`
  - Show verify `get-config` and how to check `online_version.version`

---

### Task 5: Final Doc Polish + Commit

**Files:**
- Modify: `skills/social-pet-tools/commands/tcc.md`

- [ ] **Step 1: Self-review against the spec**
  - Confirm:
    - Terminology makes `env` vs `--site` unambiguous
    - No `--tcc-site` remains in the doc
    - Command forms use `tcc get-config` etc.
    - The success loop is fully copy-pastable

- [ ] **Step 2: Commit the doc change**
  - Run:
    ```bash
    git add skills/social-pet-tools/commands/tcc.md
    git commit -m "docs(social-pet-tools): align tcc command templates and add success loop"
    ```

