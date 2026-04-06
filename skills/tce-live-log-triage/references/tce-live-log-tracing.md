# TCE Live Log Tracing Reference

Source condensed from the Feishu document `TCE 业务进程异常退出追查思路`.

This reference is intentionally limited to live-instance log triage.

## Scope

Applies to:

- TCE instance process exit alarms
- Service process exits with non-zero exit codes
- Live instances that can still be accessed

Does not apply to:

- Deleted instances
- Relay jump hosts
- Host-level `/opt/tiger/tce/containers/...` recovery

## Alarm Shape

Typical fields:

- service / PSM
- cluster
- pod
- host
- alarm time

Use the alarm time as the anchor when deciding whether to inspect the current run log or the previous one.

## Main Path

### 1. Enter the run log directory

```bash
cd /opt/tiger/toutiao/log/run
ls -ltr
```

Look for files shaped like:

```text
<psm>.run.log
<psm>.run.log.<date>
```

### 2. Head the current run log first

```bash
head -n 40 /opt/tiger/toutiao/log/run/${TCE_PSM}.run.log
```

Decision rule:

- If the first visible lines are near the alarm time, inspect the previous run log tail.
- If the first visible lines are clearly before the alarm time, continue reading the current file.

### 3. Inspect the likely file boundary

Previous-file tail:

```bash
tail -n 80 /opt/tiger/toutiao/log/run/${TCE_PSM}.run.log.<date>
```

Current-file tail:

```bash
tail -n 80 /opt/tiger/toutiao/log/run/${TCE_PSM}.run.log
```

The goal is to catch the last stdout/stderr right before restart.

## Go Service Fast Path

For Go services, use panic-first inspection:

```bash
grep panic -B 5 -A 20 /opt/tiger/toutiao/log/run/${TCE_PSM}.run.log*
```

This is the highest-signal shortcut for most Go abnormal exits.

If `journalctl` shows status `2`, panic is especially likely.

## systemd / journalctl

If run logs are inconclusive:

```bash
journalctl -u $TCE_PSM
```

Use it to determine:

- the latest exit status
- whether the process likely exited actively
- whether restart timing lines up with the alarm

## Interpretation Hints

- `status = 2` on Go services usually suggests panic.
- Large-scale simultaneous exits across many instances often indicate a dependency outage rather than a single-instance bug.
- When logs are sparse, prioritize exit status plus the last available stdout/stderr around restart time.

## Minimal Reporting Template

Use this shape when answering:

```text
Target: <service> / <cluster> / <pod>
Checked: <run log files>, journalctl
Evidence: <panic|exit code|stderr clue|none>
Hypothesis: <most likely explanation>
Next step: <one concrete follow-up>
```
