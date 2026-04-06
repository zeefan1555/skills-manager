---
name: tce-live-log-triage
description: Use when investigating errors, abnormal exits, panic logs, or non-zero exit alarms on a still-running TCE instance, especially when the user wants to inspect live pod logs on TCE rather than deleted instances or host-level relay paths.
---

# TCE Live Log Triage

## Overview

This skill is for error-log triage on live TCE instances only.

Prefer `bytedcli tce` to locate the right service, cluster, and instance before entering the container context. Once on the instance, follow a fixed log-reading order instead of grepping blindly.

Do not use this skill for deleted pods, relay jump hosts, or physical-machine log recovery.

## When to Use

- The user wants to inspect a live TCE instance for errors.
- The symptom is abnormal exit, non-zero exit code, panic, crash loop, or process exit alarm.
- The pod or instance is still alive and can still be accessed.
- The target is a TCE service, instance, cluster, or pod.

Do not use this skill if the instance has already been deleted. This skill intentionally excludes relay and host-level fallback paths.

## Inputs

Try to establish these fields first:

- `service` or `PSM`
- `instance` or `pod`
- `cluster`

If one of them is missing, resolve it with `bytedcli tce` before doing log analysis.

## Workflow

1. Confirm the target is a live TCE instance.
2. Use `bytedcli tce` to resolve service, cluster, and instance identity.
3. Open a shell on the live instance.
4. Inspect `/opt/tiger/toutiao/log/run`.
5. Compare log timestamps with the alarm time before deciding which file to read.
6. For Go services, search `panic` first.
7. Check `journalctl -u $TCE_PSM` for the most recent exit status.
8. Summarize root-cause clues, evidence, and next actions.

## bytedcli First

Prefer `bytedcli` to find the target before entering the instance:

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json tce search-service --keyword "<service-or-psm>"
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json tce list-service-clusters --service-id "<service_id>"
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json tce list-instance --service-id "<service_id>" --cluster "<cluster>"
```

If the user already gave a pod name or instance identifier, use that to narrow the target immediately.

## On-Instance Log Order

Once you are on the instance, use this order:

1. `cd /opt/tiger/toutiao/log/run`
2. Identify the current run log for the process.
3. `head` the current log first and compare its earliest visible timestamp with the alarm time.
4. If the first lines are already near the alarm time, inspect the tail of the previous run log.
5. If the first lines are clearly before the alarm time, inspect the current file directly.

Reference details and command patterns are in:

- `references/tce-live-log-tracing.md`

## Go Services

For Go services, prefer panic-first triage:

```bash
grep panic -B 5 -A 20 /opt/tiger/toutiao/log/run/${TCE_PSM}.run.log*
```

This should be your first high-signal check for most Go abnormal exits.

If `journalctl -u $TCE_PSM` reports status `2`, treat `panic` as highly likely and inspect the run logs again with the command above.

## journalctl

If run logs do not immediately explain the exit, check:

```bash
journalctl -u $TCE_PSM
```

Use this to answer:

- What was the latest exit status?
- Was it likely an active exit from business logic?
- Is there a restart pattern that matches the alarm timing?

## Output Requirements

When reporting back, keep it structured and evidence-based:

- Target instance: service, cluster, pod
- What log files were checked
- Key evidence: panic, exit code, stderr/stdout clue, or lack of evidence
- Current hypothesis
- Next action

Do not dump huge log blocks unless the user asks. Quote only the lines needed to support the conclusion.

## Common Mistakes

- Jumping straight into arbitrary grep patterns before aligning log timestamps with the alarm.
- Ignoring the previous run log when the current file begins near the alarm time.
- Forgetting that Go service abnormal exits often surface fastest through `panic` search.
- Mixing live-instance triage with deleted-pod relay workflows.
- Reporting “no issue found” before checking both run logs and `journalctl`.
