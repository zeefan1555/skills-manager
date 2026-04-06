# TCE CDS Panic Recovery Reference

## Case Pattern

Observed failure shape:

- TCE `canary` instances were `NotReady`
- healthy `all_dc` instances existed at the same time
- `run.log` contained `cds.UpdatePath` and `errCallback`
- the callback pointed to `gameplus_chunjie_test/ppe_tab_template_im_pet/SideTagCfg`

This pattern strongly suggests workbook-backed config damage rather than generic environment failure.

This healthy-versus-unhealthy comparison is important. It lets you discard shared warnings early and focus only on log lines that correlate with the failing rollout cohort.

## Example Root Cause

Workbook:

- `ppe_tab_template/SarConst/SideTagCfg.xlsx`

Broken location:

- row `19`
- column `F`
- field: `tagShowParam`

Observed corruption:

- `enable_appid` first element was broken from `\\\"1128\\\"` into `\\\"1128,\\\"2329\\\"...`
- `tag_name` escaping was also damaged

Result:

- CDS callback failed while parsing the config payload
- `cds.UpdatePath` escalated the callback failure into a panic
- the instance stayed `NotReady` because startup never completed

## Reusable TCE Triage Pattern

Recommended sequence:

1. `tce list-instance --psm <psm> --env <env>`
2. Split pods into `Running` and `NotReady`
3. Compare rollout stage or deployment grouping
4. Search `run/<psm>.run.log` on the failing pods only
5. Ignore warnings that also appear on healthy pods
6. Stop at the first deterministic `Fatal`, `panic`, or `errCallback`
7. Enter the target `ppe` config directory and run `svn update`
8. Map the CDS path to the workbook only after the panic source is known

This avoids the common mistake of blaming `tcc update fail` or other noisy warnings that are present on both healthy and unhealthy pods.

## Minimal Repair Strategy

1. Diff current workbook against a known-good revision such as SVN `r37632`.
   Before diffing, enter the target `ppe` config directory and refresh the working copy:

```bash
cd <ppe-config-dir>
svn update
```

2. Repair only the broken shared string or target cell.
3. Keep all unrelated rows untouched.
4. Re-parse the target row after writing the file.
5. If the failure is caused by a missing `.xlsx` under a directory like `Shop/`, compare the whole directory against `prod/Shop` or `ppe_base/Shop` and batch-add every missing workbook before the next CDS refresh.
6. Verify:

```bash
unzip -tqq ppe_tab_template/SarConst/SideTagCfg.xlsx
svn status ppe_tab_template/SarConst/SideTagCfg.xlsx
svn diff ppe_tab_template/SarConst/SideTagCfg.xlsx
```

7. Commit the repair:

```bash
svn commit ppe_tab_template/SarConst/SideTagCfg.xlsx -m "fix: repair SideTagCfg malformed tagShowParam for ppe_tab_template"
```

Do not stop at local repair. The workflow is incomplete until the fix is committed.

## Directory-Level Fast Path

When the panic evolves like this:

- first `ShopBannerCfg` missing
- after refresh, startup panic moves to `ShopRecommendCfg`

do not keep fixing one file per cycle forever. Switch to a directory-level check:

```bash
find ppe_tab_template/Shop -maxdepth 1 -type f -name '*.xlsx' -exec basename {} \; | sort
find prod/Shop -maxdepth 1 -type f -name '*.xlsx' -exec basename {} \; | sort
```

If the target directory is missing several files that exist in `prod` or `ppe_base`, add the whole missing set first, then refresh CDS once. This is the fastest safe path when the startup panic is clearly caused by missing workbook files rather than malformed cell content.

If the first refresh fixes `ShopBannerCfg` and the next panic moves to `ShopRecommendCfg` or `ShopTabNewCfg`, stop doing single-file repairs and sweep the whole `Shop/` directory before the next CDS refresh.

## Feishu Bot Triggering

This bot does not reliably process app-sent messages from Codex/bytedcli. In the observed case:

- app-sent message with a valid mention had `sender_type=app` and the bot did not reply
- user-sent message with the same mention text had `sender_type=user` and the bot replied with a success card

So the reliable rule is:

- have the user send the Feishu message personally
- then read the group to confirm the bot card arrives

Expected message text:

```text
@game_cds配置机器人 更新 ppe_tab_template
```

Success criteria:

- sender is a personal user account
- bot later replies with an interactive card such as `更新成功,已同步到游戏测试环境`
- the card mentions the expected workbook path, CDS key, or SVN revision

Do not stop at the words `更新成功`. In the observed case, one refresh card only mentioned `ShopRecommendCfg` and SVN `r37967`, while the actual failing TCE pods were still blocked by missing `ShopTabNewCfg` from SVN `r37969`. Treat the card content itself as the source of truth for what was really refreshed.

Fixed bot targets for this workflow:

- `chat_id`: `oc_922afac84eeaccc771ee7a5b059e1edb`
- `bot display name`: `game_cds配置机器人`
- `game_cds配置机器人 open_id`: `ou_30225f791f6907a0cf17cb3a24fd1d44`

## Recovery Verification

After the bot reply:

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json tce list-instance --psm ttgame.social.pet --env ppe_tab_template
```

Look for one of these outcomes:

- previously failing pods become `Running`
- failing `canary` pods are replaced by new `Running` pods
- the whole `canary` cohort returns to `Running`

If the service remains `NotReady`, restart the triage from the newest failing pod and do not assume the workbook fix fully addressed the issue.

## Practical Notes

- Healthy and unhealthy pods often share warning logs; use them only for contrast, not root-cause claims.
- The workbook diff is most effective after the panic already names the failing config.
- For `.xlsx`, direct XML inspection is often faster and more reliable than opening Excel manually when the issue is broken escaping or malformed JSON.
- A full repair loop is: `panic source -> workbook fix -> svn commit -> Feishu refresh -> TCE recovery check`.
