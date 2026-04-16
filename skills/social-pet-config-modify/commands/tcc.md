# TCC Command

## Trigger

- `tcc`
- `tcc modify`
- `tcc deploy`
- “帮我改 TCC 并发布”
- “用 bytedcli 更新 TCC”
- “先改 TCC 再发布”

## 目标

通过 `bytedcli` 完成一轮可追溯的 TCC 配置修改与发布闭环：

1. 读取当前 TCC 配置
2. 备份修改前内容
3. 更新目标字段
4. 发布配置
5. 返回 deployment 结果或 review 信息

## 参考来源

优先参考：

- `bytedance-tools/references/tcc.md`
- `bytedcli` skill 中关于 `tcc update-config` / `tcc deploy-config` 的说明

统一命令前缀：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json
```

## 输入

执行前优先收集：

- `namespace`
- `config_name`
- `env`
- `region`
- `dir`，默认可为 `/default`
- `tcc-site`
- 字段路径
- 新值
- 发布说明 `note`

如果用户没有明确说明，默认优先：

- 环境使用 `ppe_*`
- 区域使用 `CN`
- 不操作 `prod`

## 执行步骤

### 第 1 步：先确认认证与参数

必要时先确认 `bytedcli` 已登录：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json auth status
```

如果缺少关键参数，优先补齐，不要直接猜：

- `namespace`
- `config_name`
- `env`
- `tcc-site`

### 第 2 步：读取当前配置并落盘备份

先读取当前值：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json tcc get-config "<namespace>" "<config_name>" --env "<env>" --region "<region>" --dir "<dir>" --tcc-site "<tcc-site>"
```

建议将修改前内容落盘为临时文件，例如：

```text
/tmp/tcc_<config_name>_before.json
```

原则：

- 先读后改
- 必须保留修改前值，方便回滚或复核
- 如果读取失败，先停下，不进入 update

### 第 3 步：生成修改后内容

根据字段路径和新值，构造修改后的配置内容。

修改原则：

- 只改目标字段
- 不重排无关内容
- 不顺手清理其他键
- 修改后重新比对目标字段，确认写入正确

建议将修改后内容写入单独文件，例如：

```text
/tmp/tcc_<config_name>_after.json
```

### 第 4 步：执行 update-config

使用修改后文件或值执行更新：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json tcc update-config "<namespace>" "<config_name>" --env "<env>" --tcc-site "<tcc-site>" --region "<region>" --dir "<dir>" --file /tmp/tcc_<config_name>_after.json --note "<note>"
```

说明：

- 如果环境或 namespace 需要 V2 回退链路，交给 `bytedcli` 自动处理
- 如果同一配置存在同步区域组，按 `bytedcli` 默认补齐行为执行，不手工拆分多次 update
- update 失败时，优先返回错误摘要，不直接进入 deploy

### 第 5 步：执行 deploy-config

更新成功后继续发布：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json tcc deploy-config "<namespace>" "<config_name>" --env "<env>" --tcc-site "<tcc-site>" --region "<region>"
```

处理规则：

- 默认使用自动发布链路
- 如果返回需要 review，不要伪装成“已发布成功”，而是返回 review 信息
- 如果用户明确要求只创建 deployment、不自动开始，可使用 `--publish-mode manual`
- 未经用户明确确认，不要对 `prod` 使用 `force-auto`

### 第 6 步：返回结果摘要

执行完成后，至少返回：

- `namespace`
- `config_name`
- `env / region / dir / tcc-site`
- 修改字段
- 修改前值 / 修改后值
- `update-config` 结果摘要
- `deploy-config` 结果摘要
- 如果需要 review，给出 review / deployment 信息

## 推荐返回结构

- 目标 TCC 配置
- 修改内容
- update 结果
- deploy 结果
- 是否需要人工 review
- 如需回滚，使用哪个 `before` 文件

## 常见错误

- 没先 `get-config` 就直接更新
- 缺少 `namespace` 或 `config_name` 就开始猜
- update 成功后忘了 deploy
- deploy 返回 review 流程却误报“发布完成”
- 未经确认修改或发布 `prod`
- 没有保留修改前内容，导致回滚困难

## 收口规则

只有同时满足以下条件，才算本次命令完成：

- 已成功读取当前配置
- 已生成并确认修改后内容
- `update-config` 成功
- 已执行 `deploy-config`，并拿到 deployment 结果或 review 信息
- 已向用户返回完整摘要
