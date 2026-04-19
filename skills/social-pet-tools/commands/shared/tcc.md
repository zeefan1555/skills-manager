# TCC Command

> **命令类型**：`shared`
>
> **典型调用方**：`../workflows/goal-rpc-loop.md`、`../workflows/goal-code-loop.md`

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

把 `social_pet` 相关 TCC 修改与发布任务统一路由到稳定的 bytedcli 执行方式，并保留必要的 before / after / verify 证据。

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

1. 先确认任务属于 `social_pet` 相关 TCC 配置修改。
2. 使用 bytedcli 的标准命令形态完成：
   - `auth status`（必要时）
   - `tcc get-config`
   - 备份 `before` 内容
   - 生成 `after` 内容
   - `tcc update-config`
   - `tcc deploy-config`
   - 发布后再次 `get-config` 校验
3. 结论必须基于真实回包和发布后读取结果，而不是口头判断。

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

读取当前配置：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json \
tcc get-config "<namespace>" "<config_name>" \
  --env "<env>" --region "<region>" --dir "<dir>" \
  --site "<site>" > /tmp/tcc_<config_name>_<env>_get.json
```

更新配置：

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

发布后验证：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json \
tcc get-config "<namespace>" "<config_name>" \
  --env "<env>" --region "<region>" --dir "<dir>" \
  --site "<site>" > /tmp/tcc_<config_name>_<env>_verify_get.json
```

## 证据落盘

产物落盘到当前 session 的 `tcc/` 子目录：

```text
docs/social-pet/<date-topic>/tcc/
```

建议至少保留：

- `tcc_<config_name>_<env>_get.json`
- `tcc_<config_name>_<env>_before_base.json`
- `tcc_<config_name>_<env>_after_base.json`
- `tcc_<config_name>_<env>_update.json`
- `tcc_<config_name>_<env>_deploy.json`
- `tcc_<config_name>_<env>_verify_get.json`
- `verdict.md`

## 收口规则

只有同时满足以下条件，才算本命令完成：

- 已确认目标配置和环境
- 已完成 before / after 对比
- 已成功 update 和 deploy
- 已做发布后 `get-config` 校验
- 已保留证据文件和一句话结论
