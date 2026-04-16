---
name: social-pet-config-modify
description: Use when需要在本机 `im_pet` 的 `ppe_*` SVN 配置目录中修改 social_pet 相关 CDS 配置，并按固定流程执行 `svn update`、最小化改动、`svn commit` 和生成 Lark 通知文案时使用。
---

# Social Pet CDS 配置修改

统一入口 skill。

这个 skill 只负责：

- 判断用户要执行哪个命令
- 约束固定目录、固定流程和固定通知方式
- 把请求路由到 `commands/*.md`

具体执行动作放在 `commands/`。

## 适用范围

- 仅处理本机目录 `/Users/bytedance/bytecode/im_pet/<ppe_xxx_xxx>`
- 处理 `social_pet` 相关 CDS / SVN 配置修改，以及通过 `bytedcli` 执行 TCC 配置修改与发布
- 默认面向 `ppe_*` 环境
- CDS 场景默认修改后执行 `svn commit`
- TCC 场景默认按 `get -> update -> deploy` 闭环执行
- 最终产出可复制通知文案或部署结果摘要

## 不适用范围

- 不处理纯代码仓库改动
- 不处理未明确目标字段的大范围配置重写
- 不默认直接替用户向机器人发消息
- 未经用户明确确认时，不默认修改或发布 `prod` TCC

## 目录结构

```text
social-pet-config-modify/
├── SKILL.md
└── commands/
    ├── cds.md
    └── tcc.md
```

## 固定约束

1. 进入目标 `ppe_*` 目录后，必须先执行 `svn update`，再读文件、改文件、看 diff。
2. 只能做最小必要修改，不要顺手改格式、排序或无关字段。
3. 如果匹配到多个候选文件，必须先列出候选并让用户确认，不要猜。
4. `svn diff` 必须可解释；若 diff 混入无关改动，先停下来提示用户。
5. 默认执行 `svn commit`；未 commit 不能宣称配置已完成。
6. 提交完成后，必须返回可复制通知文案，而不是只说“你去通知机器人”。
7. CDS 通知群固定为 `oc_922afac84eeaccc771ee7a5b059e1edb`，机器人固定为 `game_cds配置机器人`。
8. TCC 命令优先使用 `NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json ...` 形式，先读后改再发布。

## 命令路由

### 显式命令

| 用户输入 | 路由到 |
|---|---|
| `modify` | `commands/cds.md` |
| `cds modify` | `commands/cds.md` |
| `config modify` | `commands/cds.md` |
| `tcc` | `commands/tcc.md` |
| `tcc modify` | `commands/tcc.md` |
| `tcc deploy` | `commands/tcc.md` |

### 语义命令

| 用户意图 | 路由到 |
|---|---|
| “帮我改 ppe 配置” | `modify` |
| “帮我改 cds 配置并提交” | `modify` |
| “去 SVN 配置目录改一个字段” | `modify` |
| “帮我改 TCC 并发布” | `tcc` |
| “用 bytedcli 更新 TCC” | `tcc` |
| “先改 TCC 再发布” | `tcc` |

## 输入要求

执行 `modify` 或 `tcc` 前，优先补齐这些信息：

- CDS: `ppe` 目录名，例如 `ppe_xxx_xxx`
- CDS: 配置文件名、配置关键词，或可定位到文件的业务名
- TCC: `namespace`、`config_name`、`env`、`region`、`dir`、`tcc-site`
- 要修改的字段路径
- 新值
- 提交说明或发布说明

如果以上信息缺失，优先问最少的问题补齐，不要直接盲搜全目录后修改，也不要盲发 TCC 更新。

## 标准返回

执行完成后，至少返回：

- 实际进入的目录
- 修改的配置文件路径
- 改动字段与新值
- `svn commit` 结果或 revision
- 一条可复制 Lark 文案，或 TCC deployment / review 摘要

Lark 文案格式固定为两段：

1. 给当前用户看的提示：
   - `@张菲帆 已完成 <ppe_name> 配置提交，svn revision: <rev>`
2. 供复制到群里的文案：
   - `@game_cds配置机器人 更新 <ppe_name>`

## 给 agent 的执行顺序

1. 先读取本文件判断是 `cds` 还是 `tcc`。
2. CDS 只加载 `commands/cds.md`；TCC 只加载 `commands/tcc.md`。
3. CDS 在固定目录下执行 `svn update -> 搜索文件 -> 修改 -> svn diff -> svn commit`。
4. TCC 按 `get-config -> update-config -> deploy-config` 执行。
5. 返回变更摘要和可复制通知文案或 deployment 摘要。
