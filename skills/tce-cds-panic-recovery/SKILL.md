---
name: tce-cds-panic-recovery
description: Use when a TCE canary or live instance fails to become Ready because a panic or errCallback in cds.UpdatePath points to a broken CDS-backed config file, and the task is to repair the config, commit it, trigger CDS refresh in Feishu, and verify TCE recovery.
---

# TCE CDS Panic Recovery

## Overview

Use this skill when service startup fails on a CDS-backed config and the task is not finished at root-cause identification. The expected outcome is a full repair loop: identify the bad config payload, patch the exact file content, commit the file, trigger CDS refresh, and confirm the affected TCE instances recover.

Prefer `bytedcli tce` and live logs to confirm the failing config path first. Treat workbook repair, `svn commit`, Feishu bot refresh, and TCE re-check as part of one workflow rather than independent optional steps.

## When to Use

- A TCE instance is `NotReady`, crash-looping, or exits during startup.
- `run.log` or panic stack mentions `cds.UpdatePath`, `errCallback`, or a CDS config key.
- The CDS key maps to a CDS-backed config file such as `SideTagCfg`, `EntranceCfg`, or similar.
- The likely root cause is malformed config content rather than code logic.
- The user expects the issue to be fixed and pushed through the normal config-update path, not just diagnosed.

Do not use this skill for deleted pods, host-level recovery, or pure code panics with no config callback in the stack.

## Inputs

Try to establish these fields first:

- `service` or `PSM`
- `cluster`
- `instance` or `pod`
- failing CDS key or workbook name
- target `ppe` config directory
- config file path in SVN or local workspace

These Feishu targets are fixed for this workflow:

- config bot group `chat_id`: `oc_922afac84eeaccc771ee7a5b059e1edb`
- config bot display name: `game_cds配置机器人`

## Workflow

1. Confirm this is a live-instance startup failure.
2. Use `bytedcli tce` to separate healthy pods from failing pods before reading logs deeply.
3. Read `run.log` on the failing pods and capture the first deterministic panic or `errCallback`.
4. Enter the target `ppe` config directory and run `svn update` before opening or diffing local files.
5. Map the failing CDS key to the workbook path.
6. If the panic is caused by a missing `.xlsx` under one config subdirectory such as `Shop/`, compare the target directory against a known-good sibling such as `prod/Shop` or `ppe_base/Shop` and add all missing files in that directory before the first refresh.
7. Compare the freshly updated local workbook with a known-good revision or sibling environment file.
8. Narrow the damage to the exact row, column, and field value.
9. Patch the minimal broken config content only.
10. Verify file integrity and minimal diff after the fix.
11. `svn commit` the config change.
12. Have the user send a real Feishu `@` mention to the config bot from their personal account to refresh CDS in the target `ppe` environment.
13. Re-check the group for bot acknowledgment and verify the reply card contains the expected workbook path or SVN revision, rather than only assuming the environment refresh succeeded.
14. Re-check TCE readiness and compare pod turnover after the confirmed refresh.

## Triage Order

Start from TCE scope, then logs, then the workbook.

High-signal sequence:

1. List live instances and split them into `Running` versus `NotReady`.
2. If healthy and unhealthy pods coexist, treat the issue as scoped to a stage, rollout, or config cohort rather than a full environment outage.
3. Read `run/<psm>.run.log` on the failing pods only.
4. Ignore warnings that also appear on healthy pods.
5. Stop at the first deterministic panic or `Fatal`.
6. Extract the CDS path or config name from `errCallback`.
7. Enter the target `ppe` directory and run `svn update`.
8. If one required `.xlsx` is missing under a directory like `Shop/`, diff the filename set of that whole directory against `prod` or `ppe_base` before refreshing CDS.
9. If the first refresh only fixes one workbook and the panic moves to another missing workbook in the same directory, switch immediately to a directory-level missing-file sweep instead of repairing one file per cycle.
10. Only then open the config file and diff it.

This avoids “the config file looks suspicious” guessing.

## TCE First

Prefer `bytedcli tce` and log search before opening the workbook:

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json tce list-instance --psm "<psm>" --env "<env>"
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json log search-prod-instance-log --psm "<psm>" --env "<env>" --range 30m --path "run/<psm>.run.log" --keyword "<pod-suffix>"
```

Use this stage to answer:

- Is the whole environment down or only some pods?
- Are the failing pods concentrated in `canary`, one deployment, or one rollout wave?
- Which log lines are unique to failing pods?

## Config Repair

When the stack already narrows to a CDS-backed config file:

- Enter the target `ppe` config directory first and refresh the working copy:

```bash
cd <ppe-config-dir>
svn update
```

- Use the file format that actually backs the config. For `.xlsx`, unzip it and inspect `xl/sharedStrings.xml` and the target sheet XML if needed.
- Compare the current config file against a known-good version from:
  - a previous SVN revision
  - a stable sibling environment such as `ppe_base`
- If the stack shows a config name like `ShopBannerCfg` and the target subdirectory is missing that workbook entirely, compare the whole sibling directory against `prod` or `ppe_base` and batch-add the remaining missing `.xlsx` files in that same directory before the next CDS refresh.
- Focus on malformed JSON, broken escaping, missing delimiters, or shifted columns.
- Patch only the broken string, row, or field instead of bulk-rewriting the config source.
- Do not modify unrelated rows, sheets, files, or formatting.

Reference details and reusable examples are in:

- `references/tce-cds-panic-recovery.md`

## Verification

Before claiming the fix is done:

- Confirm you are working on a freshly updated SVN working copy in the target `ppe` directory.
- Confirm the repaired row or field matches the known-good revision where expected.
- If the config file is `.xlsx`, verify it still opens as a valid zip:

```bash
unzip -tqq <workbook>.xlsx
```

- Check local SCM state:
  - the file should be the only intended change
  - the diff should match the target row or cell only

```bash
svn status <workbook>.xlsx
```

- If you changed only one row, re-read that row after writing the file.
- Do not move on to `svn commit` unless the diff is minimal and understandable.

## SVN Commit

This skill assumes `svn commit` is part of the normal repair loop, not an optional afterthought.

Minimum standard:

```bash
svn diff <config-file>
svn commit <config-file> -m "<clear repair message>"
```

The commit message should name:

- the config file
- the broken field or config
- the target environment when useful

Do not claim the config is fixed if the repair exists only in a local working copy.

## Feishu CDS Refresh

Do not assume Codex can trigger this bot by sending a message itself. In practice, this bot responds to messages from a personal Feishu user account and may ignore app-sent messages even if they contain a valid mention. Treat human-sent mention from the user as the reliable path.

Pattern:

```bash
<user manually sends in Feishu group>
@game_cds配置机器人 更新 <env_name>
```

After the user sends it:

- Read recent group messages.
- Confirm the message sender is a personal Feishu user, not an app sender.
- Wait for the bot’s interactive reply card before declaring CDS refresh complete.
- Confirm the reply card names the expected workbook path, CDS key, or SVN revision.
- If the reply card only mentions an older workbook or older SVN revision, treat the refresh as incomplete and ask the user to trigger the bot again.

The default target is the affected `ppe` lane or environment derived from the panic triage.

Do not ask the user for another group unless they explicitly say the rollout group changed.

## TCE Recovery Check

After the bot acknowledges the update:

1. Re-list the TCE instances for the same `psm/env`.
2. Compare the pre-refresh and post-refresh pod sets instead of checking only one remembered pod name.
3. Check whether the previously failing pods changed from `NotReady` to `Running`.
4. If a new canary pod was created, validate the new pod first instead of anchoring only on the old pod.
5. If all canary pods are `Running`, stop and report recovery complete.
6. If the service is still not ready, restart the loop from the newest failing pod rather than assuming the workbook fix was sufficient.

## Output Requirements

Report back with:

- failing instance and cluster
- panic evidence and CDS path
- config file path
- exact broken row and column
- what value was fixed
- verification performed before commit
- SVN revision or commit result
- whether the Feishu bot acknowledged the update
- what exact workbook path or SVN revision the bot said it refreshed
- whether TCE recovered after the refresh

The skill is not complete until all four states are true:

- deterministic panic source identified
- workbook repaired and committed
- Feishu bot acknowledged the update
- TCE recovery verified

## Common Mistakes

- Opening Excel first and guessing before reading the panic stack.
- Inspecting or editing a stale local SVN working copy before `svn update`.
- Treating all pods as equally broken before checking whether healthy pods still exist.
- Treating shared warnings as root cause without healthy/unhealthy comparison.
- Rewriting large config sections instead of patching the minimal bad field.
- Forgetting to verify zip integrity after modifying `.xlsx`.
- Stopping after local repair without `svn commit`.
- Sending a bot mention from Codex/bytedcli and assuming the robot will process app-sent messages.
- Refreshing only one missing `.xlsx` after a directory-level missing-file pattern has already been established.
- Declaring CDS update complete before the bot replies in group.
- Treating `更新成功` as sufficient when the bot card still points to an older workbook or older SVN revision.
- Declaring repair complete before the target TCE pods return to `Running`.
