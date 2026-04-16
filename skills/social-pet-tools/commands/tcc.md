# TCC Command

> **引用规范**：`../references/conventions.md`、`../references/mapping.md`

## 术语与参数（避免混淆）

- `env`：TCC 环境（例如 `ppe_tab_template` / `ppe_xxx` / `prod`）
- `--site`：ByteCloud site（bytedcli 全局参数，例如 `cn` 对应 `cloud.bytedance.net`；也可能是 `boe` / `i18n-bd` 等）

常见坑：

- `prod` 通常是 `env` 的一个值，不是 `--site` 的值。不要把“发 prod”与“site=prod”混为一谈。

## Trigger

- `tcc`
- `tcc modify`
- `tcc deploy`
- “帮我改 TCC 并发布”
- “用 bytedcli 更新 TCC”
- “先改 TCC 再发布”

## 目标

把 `social_pet` 相关 TCC 修改与发布任务统一路由到已有成熟流程，同时保持聚合层只做命令入口，不重写底层 bytedcli / 旧 skill 的实现细节。

## 输入

- `namespace`
- `config_name`
- `env`
- `region`
- `dir`
- `site`（CLI 里用 `--site`；不填时默认 `cn`）
- 字段路径
- 新值
- 发布说明 `note`

如果以上关键信息缺失，优先补最少必要信息，不要直接猜测配置目标并发布。

## 执行边界

1. 先确认任务属于 `social_pet` 相关 TCC 配置修改，而不是通用字节侧 TCC 运维。
2. 读取 `../references/conventions.md`，沿用聚合层的中文结论、证据保留和最小变更原则。
3. 读取 `bytedance-tools/references/tcc.md`，沿用 bytedcli 的标准命令形态与参数约束。
4. 如需 social-pet 范围内的既有沉淀，优先回退到旧 `social-pet-config-modify` 中的 TCC 命令细节：
   - `social-pet-config-modify/commands/tcc.md`
5. 在旧 skill / bytedcli 细节约束下完成：
   - `auth status`（必要时）
   - `tcc get-config`
   - 备份 `before` 内容
   - 生成 `after` 内容
   - `tcc update-config`
   - `tcc deploy-config`
   - 返回 deployment / review 摘要

## 命令模板（已验证形态）

统一命令前缀：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json
```

必要时检查登录：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json auth status
```

查看可用 `--site`：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json tcc list-sites
```

读取当前配置（建议先把回包落盘，后续所有操作都引用这个证据）：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json \
tcc get-config "<namespace>" "<config_name>" \
  --env "<env>" --region "<region>" --dir "<dir>" \
  --site "<site>" > /tmp/tcc_<config_name>_<env>_get.json
```

更新配置（用 `--file`，避免 inline value 被 shell/引号污染）：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json \
tcc update-config "<namespace>" "<config_name>" \
  --env "<env>" --region "<region>" --dir "<dir>" \
  --file /tmp/tcc_<config_name>_<env>_after_base.json \
  --note "<note>" \
  --site "<site>" > /tmp/tcc_<config_name>_<env>_update.json
```

发布配置：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json \
tcc deploy-config "<namespace>" "<config_name>" \
  --env "<env>" --region "<region>" \
  --site "<site>" > /tmp/tcc_<config_name>_<env>_deploy.json
```

发布后验证（以 `online_version.version` 和目标字段值为准）：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json \
tcc get-config "<namespace>" "<config_name>" \
  --env "<env>" --region "<region>" --dir "<dir>" \
  --site "<site>" > /tmp/tcc_<config_name>_<env>_verify_get.json
```

## 证据落盘（推荐文件集）

产物落盘到当前 session 的 `tcc/` 子目录（详见 `../references/conventions.md` "证据落盘路径规范（AI 审计目录）"）：

```
docs/social-pet/<date-topic>/tcc/
```

执行过程中的临时文件仍写 `/tmp`，但最终证据应拷贝到上述目录：

- `tcc_<config_name>_<env>_get.json` — 修改前配置
- `tcc_<config_name>_<env>_before_base.json` — 修改前 base
- `tcc_<config_name>_<env>_after_base.json` — 修改后 base
- `tcc_<config_name>_<env>_update.json` — update 回包
- `tcc_<config_name>_<env>_deploy.json` — deploy 回包
- `tcc_<config_name>_<env>_verify_get.json` — 发布后验证
- `verdict.md` — AI 判定（含变更前后对比、发布结果、结论）

## 最小改动模板（JSON base：列表字段去重追加）

适用于 TCC `data_type=json`，且需要对某个 list 字段追加一个字符串（例如 `check_white_list`）。

```bash
python3 - <<'PY'
import json
from pathlib import Path

GET = Path("/tmp/tcc_<config_name>_<env>_get.json")
OUT_BEFORE = Path("/tmp/tcc_<config_name>_<env>_before_base.json")
OUT_AFTER = Path("/tmp/tcc_<config_name>_<env>_after_base.json")

FIELD = "check_white_list"
VALUE_TO_ADD = "7610720767763841588"

resp = json.loads(GET.read_text())
base_str = resp["data"]["latest_version"]["base"]
base = json.loads(base_str)

# Save normalized before for review/rollback.
OUT_BEFORE.write_text(json.dumps(base, ensure_ascii=True, indent=2) + "\n")

wl = base.get(FIELD)
if wl is None:
    wl = []
if not isinstance(wl, list):
    raise SystemExit(f"{FIELD} is not a list: {type(wl)}")

wl = [str(x) for x in wl]
if VALUE_TO_ADD not in wl:
    wl.append(VALUE_TO_ADD)
base[FIELD] = wl

OUT_AFTER.write_text(json.dumps(base, ensure_ascii=True, indent=2) + "\n")
print("before:", json.loads(OUT_BEFORE.read_text()).get(FIELD))
print("after: ", wl)
PY
```

## 端到端示例：WidgetConfig.check_white_list 追加一条白名单

参数约定（示例）：

- `namespace=ttgame.social.pet`
- `config_name=WidgetConfig`
- `env=ppe_tab_template`
- `region=CN`
- `dir=/default`
- `site`：不填则默认 `cn`

1. 读取并落盘：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json \
tcc get-config "ttgame.social.pet" "WidgetConfig" --env "ppe_tab_template" --region "CN" --dir "/default" \
> /tmp/tcc_WidgetConfig_ppe_tab_template_get.json
```

2. 生成 before/after（仅改 `check_white_list`，去重追加字符串）：

```bash
python3 - <<'PY'
import json
from pathlib import Path

GET = Path("/tmp/tcc_WidgetConfig_ppe_tab_template_get.json")
OUT_BEFORE = Path("/tmp/tcc_WidgetConfig_ppe_tab_template_before_base.json")
OUT_AFTER = Path("/tmp/tcc_WidgetConfig_ppe_tab_template_after_base.json")

VALUE_TO_ADD = "7610720767763841588"
resp = json.loads(GET.read_text())
base = json.loads(resp["data"]["latest_version"]["base"])
OUT_BEFORE.write_text(json.dumps(base, ensure_ascii=True, indent=2) + "\n")

wl = base.get("check_white_list") or []
if not isinstance(wl, list):
    raise SystemExit("check_white_list is not a list")
wl = [str(x) for x in wl]
if VALUE_TO_ADD not in wl:
    wl.append(VALUE_TO_ADD)
base["check_white_list"] = wl

OUT_AFTER.write_text(json.dumps(base, ensure_ascii=True, indent=2) + "\n")
print("after.check_white_list =", wl)
PY
```

3. update-config（落盘结果）：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json \
tcc update-config "ttgame.social.pet" "WidgetConfig" --env "ppe_tab_template" --region "CN" --dir "/default" \
  --file /tmp/tcc_WidgetConfig_ppe_tab_template_after_base.json \
  --note "test: add 7610720767763841588 to WidgetConfig.check_white_list" \
> /tmp/tcc_WidgetConfig_ppe_tab_template_update.json
```

4. deploy-config（落盘结果）：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json \
tcc deploy-config "ttgame.social.pet" "WidgetConfig" --env "ppe_tab_template" --region "CN" \
> /tmp/tcc_WidgetConfig_ppe_tab_template_deploy.json
```

5. 验证线上版本：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json \
tcc get-config "ttgame.social.pet" "WidgetConfig" --env "ppe_tab_template" --region "CN" --dir "/default" \
> /tmp/tcc_WidgetConfig_ppe_tab_template_verify_get.json
```

验证点（建议用脚本/肉眼都能核对）：

- `data.online_version.version` 是否递增
- `json.loads(data.online_version.base)["check_white_list"]` 是否包含目标字符串

## 返回给用户

- `namespace` / `config_name`
- `env` / `region` / `dir` / `site`
- 修改字段与新值
- 修改前值 / 修改后值
- `update-config` 结果摘要
- `deploy-config` 结果摘要
- 如果需要人工 review，返回 review / deployment 信息

## 约束

- 不在聚合层虚构第二套 TCC 发布 SOP
- 不跳过 `get-config`、`update-config`、`deploy-config`
- 不在参数不全时盲猜 `namespace`、`config_name` 或 `site`
- 未经用户明确确认，不默认修改或发布 `prod`
- 与旧 `social-pet-config-modify` 或 bytedcli 说明冲突时，以底层已验证的细节为准
