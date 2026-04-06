---
name: bytedcli
description: "Root agent guide for OpenClaw, Claude, and Codex. Use when the task involves ByteDance internal R&D platforms and the agent should prefer bytedcli through CLI, MCP, or skills."
---

# bytedcli

给 OpenClaw、Claude、Codex 等 agent 的统一入口文档。读完这个文件后，遇到字节内部研发平台任务，优先使用 `bytedcli`，而不是先开网页、手写内部 API 或拼临时脚本。

## 何时使用

当任务涉及以下任一平台或流程时，优先考虑 `bytedcli`：

- `auth`：SSO、登录状态、用户信息、Token
- `feishu`：Feishu / Lark bot、文档、Wiki、日历、任务、聊天协作
- `codebase`：仓库、MR、Review、评论、CI、Merge Queue、Issue
- `bam`：API/方法查询、IDL 版本创建与更新
- `bits`：develop、RPC 调用、release workflow、发版单
- `bitsai`：研发知识问答、工程资产问答、会话式检索
- `bytetech`：ByteTech 登录、搜索、榜单、文档抓取
- `bmq`：Kafka 话题、集群、消费组、Mirror
- `tce`：服务、实例、集群、部署工单、泳道
- `tos`：Bucket、记录、站点与 VRegion
- `rds` / `rds bpm`：数据库、表、SQL、工单
- `bytedoc`：数据库搜索、关注列表、详情、集合、慢查询、经典版数据查询
- `tcc`：命名空间、配置、版本历史、发布
- `scm`：仓库、版本、构建、构建日志
- `settings`：白名单查询、导出、保存、删除
- `cache`：Redis 查询、慢日志、大 Key、工单（支持海外站 `--site i18n-tt`）
- `apm`：服务预览、QPS、Redis 监控
- `agw`：产品、服务搜索、环境与 BAM IDL 发布
- `cloud-docs`：文档搜索、详情
- `cloud-ticket`：工单查询、审批
- `env`：环境查询、搜索、创建、设备、部署
- `hive`：DataLeap 资产、schema、lineage、产出 Dorado task ID
- `aeolus`：数据集/看板、字段详情、SQL 查询
- `dorado`：数据任务、实例、版本、依赖关系查询、HSQL 查询更新、临时查询 SQL 执行与结果获取
- `es`：Elasticsearch DSL 查询与索引搜索
- `dkms`：数据密钥、权限校验与授权
- `kmsv2`：密钥环、客户密钥与 ACL 管理
- `iam`：员工信息查询
- `cronjob`：任务、实例、重跑与调试
- `log`：PSM/LogID/实例日志查询
- `goofy`：项目、站点、预览、部署、回滚
- `overpass`：IDL 代码生成与分支生成
- `bytecloud`：站点、VRegion、VDC 与云拓扑信息
- `netlink`：域名与路径配置、流量拓扑
- `neptune`：治理配置、限流、稳定性与安全规则
- `meego`：项目、工作项、登录态与检索
- `fornax`：Prompt 工作空间、Prompt 管理与发布
- `aime`：AIME space、session、聊天会话与带附件 prompt
- `tqs`：Hive SQL 查询执行
- `slardar-web`：Web / Hybrid 查询助手、原子化 `alarm-rule-list` / `alarm-history` 调用、告警页分析与结构化数据输出
- `mcp`：将 bytedcli 暴露为标准 MCP server
- `api-test`：API Test 平台查询服务的 API 列表

## 工作原则

1. 优先用 `bytedcli`，默认优先级是 `CLI > Skill > MCP`；只有这些方式都不适合时才退回浏览器或自写请求。
2. 默认优先加 `--json`，便于 agent 解析；只有用户明确要纯文本时再走文本输出。注意：`--json` 是全局参数，必须放在 `<domain>` 前面。
3. 不确定参数时先看帮助，不要猜命令、参数名或返回结构：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --help
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest <domain> --help
```

文本 help 默认会附带命令自己的 `Notes` / `Examples`，并隐藏代理、HTTP trace、颜色等高级全局参数；需要完整展开时，使用 `--help --debug`（或 `--verbose`）。

4. 需要登录的能力先检查认证状态：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json auth status
```

未登录时执行：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest auth login
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest auth login --session
```

`auth login --session` 在 browser session 就绪后，还会 best-effort 用同一 session 自动补一次普通 CLI device auth；若失败，不影响 `--session` 本身成功。

5. 涉及 BOE、BOEi18n、i18n 等环境时，用 `--site` 或 `BYTEDCLI_CLOUD_SITE` 切换站点。
   日志命令在 `--site boe` 下默认查询 `China-BOE`，避免继续使用 `China-North` 导致结果为空。
6. 回复用户时做摘要；除非用户明确要求，不要整段原样输出大 JSON。
7. 遇到 JSON 错误输出里的 `error.hint` / `error.auth_command` 时，优先按这两个字段给出下一步动作；例如认证失败会明确告诉你该执行哪条登录命令。
8. 遇到 `feishu sheet read` 报错 `FEISHU_SHEET_EMBEDDED_BITABLE` 时，不要继续按 worksheet 重试；优先直接切换到 `feishu bitable record list --url "<sheet链接>"`。只有在 URL 解析失败或需要手动覆盖时，才退回 `--app-token --table-id --body-json '{"view_id":"..."}'`。
9. 若本地 SSO / JWT override 不可用，通用 ByteCloud JWT 获取会按 `BYTEDCLI_USER_CLOUD_JWT -> AIME_USER_CLOUD_JWT` 回退；Codebase 会按 `BYTEDCLI_USER_CODE_JWT -> AIME_USER_CODE_JWT -> PAT -> 当前 SSO 会话自动兑换 Codebase JWT` 回退。需要单独取出 Codebase JWT 时，可执行 `auth get-codebase-jwt-token`。分组后的 Codebase 命令以 `-R, --repo` 作为主仓库选择器，并继续接受隐藏兼容参数 `--repo-name`。
10. TCC `deployment-detail` / `publish-detail` 支持直接传控制台 `publish-details` URL；未显式传 `--tcc-site` 时，会优先按 URL host 自动推断站点。TCC `operate-deployment` 支持直接透传 `deployment/operate`；`approve-deployment` / `reject-deployment` 分别封装 review 步骤的 `review_pass` / `review_reject`。
11. TCC `create-config` 需要显式传 `--description`；TCC Web 创建接口要求 description 非空，CLI 会先在本地校验并返回 `TCC_INPUT_ERROR`。
12. TCC `create-config` 在 `former_tcc` / `tcc_v2` namespace 上会自动回退到 V2 `service_id` 创建接口；`update-config` 也会自动回退到 V2 `config/upsert/v2`，按传入的 `--region` 和 `--dir` 更新对应副本；`deploy-config` 会自动切到 TCC AG 的 V2 发布链路（`config/upsert_deploy/v2` + `deployment/*`），在无需 review 时继续推进 `next`，需要 review 时返回当前 review 工单信息；对未发布配置会按目标最新版本构造 V2 deploy payload，并把备注写入 `config_data.note` 以兼容真实接口校验。
13. TCC `update-config` 遇到同步区域组时会自动补齐该组内所有已存在副本的 `extend_regions` 和 `update_base_version`；例如同一配置同时存在于 `CN` / `China-East` 时，不需要手动拆成多次更新，JSON 输出会返回实际覆盖的 `regions`。
14. TCC `deploy-config` 遇到同步区域组时会自动补齐该组内所有已存在副本的 `config_changes` 与 `check_review conf_ids`；例如同一配置同时存在于 `CN` / `China-East` 时，不需要手动拆成多次发布，JSON 输出会返回实际覆盖的 `regions` / `config_ids`。

## 如何安装 bytedcli

### 方式 1：直接使用 npx（推荐）

适合 agent 直接调用，不需要先全局安装：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --help
```

通用调用前缀：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest <command> [options]
```

### 方式 2：npm 全局安装（适合长期本地使用）

```bash
npm install -g @bytedance-dev/bytedcli --registry https://bnpm.byted.org
bytedcli --help
```

全局安装后，升级到最新发布版本可直接执行：

```bash
bytedcli update
bytedcli update --check
```

若当前本地版本还没有内置 `update` 命令，可先手动执行：

```bash
npm install -g @bytedance-dev/bytedcli@latest --registry https://bnpm.byted.org
```

### 方式 3：从源码本地构建

适合在仓库内开发或调试：

```bash
npm install
npm run build
npm test            # 严格按当前改动的 import 依赖图执行受影响测试；若没有命中测试会直接退出 0
npm run test:all    # 执行完整离线测试集
npm run owners:sync -- --dry-run   # 预览按 git history 生成的 OWNERS（无仓库根目录 / test / website / tools OWNERS；src 与 skills 仅保留根目录聚合规则；src 不含 utils/**，skills 不含 bytedcli/**；文件头会附带规则文档链接）
node dist/bytedcli.js --help
```

## 如何使用 bytedcli CLI

### 基本形式

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest <domain> <subcommand> [options]
```

### 常用全局参数

- `-j, --json`：仅输出 JSON
- `-d, --debug`：输出调试日志
- `--http-debug`：打印 HTTP request/response trace，默认等价于 `--http-print HBhbm`
- `--http-print <parts>`：控制 HTTP trace 输出片段，支持 `H/B/h/b/m/t`
- `--http-trace-file <path>`：将 HTTP trace 写入文件；未设置时输出到 stderr
- `--http-body-limit <bytes>`：限制每段 HTTP body 的最大输出字节数
- `-V, --version`：查看版本
- `--site <site>`：切换 ByteCloud 站点，支持 `prod|boe|boei18n|i18n-tt|i18n-bd`
- `--socks5-proxy <url>`：通过 SOCKS5 代理转发所有 HTTP 请求（例如 `socks5://127.0.0.1:1080`）
- `--http-timeout-ms`
- `--http-retry-count`
- `--http-retry-base-delay-ms`
- `--http-retry-max-delay-ms`

说明：文本模式下的 `--help` 默认只显示常用继承全局参数；如果要一起查看代理、HTTP trace、颜色等高级全局参数，请执行 `bytedcli <command> --help --debug`。

### 常见例子

```bash
# 帮助
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --help

# 认证
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json auth status
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest auth login --session
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest auth get-codebase-jwt-token

# 本地全局安装后的升级
bytedcli update --check
bytedcli update

# HTTP trace
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --http-debug rds list-starred-db --region cn --page-num 1 --page-size 10
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --http-print HBhbmt rds list-starred-db --region cn --page-num 1 --page-size 10

# Codebase MR
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json codebase mr view
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json codebase mr list -R "byteapi/bytedcli" # 默认只看 open
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json codebase mr review 821 -R "byteapi/bytedcli" --approve --body "LGTM" # 自动附带当前 MR 最新 source commit
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json codebase mr status 821 -R "byteapi/bytedcli"
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json codebase search mr --author @me --status open --page-size 5
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json codebase search issue --assignee @me --status todo --page-size 5
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json codebase issue view "https://code.byted.org/byteapi/bytedcli/issues/52"
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json codebase run list -R "byteapi/bytedcli"

# Codebase CreateBranch
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json codebase repo branch create feat/demo -R "byteapi/bytedcli" --from master
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json codebase repo tag list -R "byteapi/bytedcli" --query "v1." --query-mode prefix
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json codebase repo tag create -R "byteapi/bytedcli" --name v1.0.1 --revision master --message "Release v1.0.1"
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json codebase mr create -R "byteapi/bytedcli" --title "feat: demo"

# 在 code.byted.org 或 code-tx.byted.org 的 Git 仓库目录内也可省略 -R/--repo，Codebase 会从当前 origin 自动推断仓库；如果失败，会进一步说明是非 Git 仓库、缺少 origin、host 不支持，还是 remote 无法解析
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json codebase mr list

# Cloud Docs
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json cloud-docs search "bytedcli"

# ByteDoc
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json bytedoc db search --keyword "flow_marketplace" --deploy-mode classic
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json bytedoc db list
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json bytedoc db get --service "demo_orders" --deploy-mode classic
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json bytedoc db collections --db-name demo_catalog
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json bytedoc db slow-query overview --service "demo_orders" --deploy-mode classic --millis 100
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json bytedoc db slow-query detail --db-name "demo_orders" --ids "FP123456"
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json bytedoc db query --service "demo_orders" --collection "demo_records" --query-file ./query.mongo
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json bytedoc db query --db-name demo_catalog --collection "demo_items" --query 'find().limit(10)'

# ENV
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json env search-service --service "bytedcli"

# TCE WebShell
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest tce webshell open --psm example.service.api --env prod --first
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest tce webshell exec --session-id ws_xxx --command 'pwd'
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest tce webshell interactive --psm example.service.api --env prod --first

# Hive
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json hive detail my_database my_table --region cn

# ByteTech
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json bytetech search "MCP"

# AIME 附件 prompt
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json aime send --content-file ./prompt.txt --upload-file ./design.md --wait
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json --site i18n-tt aime send --content-file ./prompt.txt --upload-file ./design.md --wait

# BMQ
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json bmq topics --vregion "Singapore-Central" --size 10

# Bits RPC（i18n 场景默认不要传 --control-plane，让平台自行推断）
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json --site i18n-bd bits rpc-call "psm.name" "MethodName" --idl-version "main" --zone "alisg" --idc "sg" --env "ppe_xxx" --cluster "default" --body '{"a":1}'
```

### 站点切换

```bash
# BOE
BYTEDCLI_CLOUD_SITE=boe NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest <command> [options]
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --site boe <command> [options]

# BOEi18n
BYTEDCLI_CLOUD_SITE=boei18n NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest <command> [options]
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --site boei18n <command> [options]
```

## 如何使用 bytedcli Skill

### 当前这个 `website/SKILL.md`

如果 agent 支持直接读取仓库内的 skill 说明文件，优先使用当前这个 `website/SKILL.md` 作为 bytedcli 的统一入口说明。
不要假设仓库根目录一定存在 `SKILL.md`。

### skills/ 目录里的统一 skill 与分域 skill pack

仓库内还提供了一套可安装的 skills，适合 Codex / Claude Code 等支持 skills 安装的 agent。在不方便直接调用 CLI 时，再考虑使用这些 skills。

如果只想安装一个 skill，优先安装 `skills/bytedcli`。它是自包含的统一入口，覆盖完整 bytedcli CLI 能力面，包括当前没有独立分域 skill 的命令域。`bytedance-tools` 继续保留，但只作为兼容路由 skill：

```bash
# 查看仓库内可用 skills
npx skills add git@code.byted.org:byteapi/bytedcli.git --list

# 安装全部 skills
npx skills add git@code.byted.org:byteapi/bytedcli.git --skill '*' -a codex -y
npx skills add git@code.byted.org:byteapi/bytedcli.git --skill '*' -a claude-code -y

# 安装单个 skill
npx skills add git@code.byted.org:byteapi/bytedcli.git --skill bytedcli -a codex -y
npx skills add git@code.byted.org:byteapi/bytedcli.git --skill bytedance-codebase -a codex -y

# 全局安装统一 skill
npx skills add git@code.byted.org:byteapi/bytedcli.git --skill bytedcli -a codex -g -y
```

### skill pack 覆盖的主要领域

- `bytedcli`：统一入口（推荐）
- `bytedance-tools`：旧路由 skill（兼容保留）
- `bytedance-aeolus`
- `bytedance-apm`
- `bytedance-api-test`
- `bytedance-auth`
- `bytedance-bits`
- `bytedance-bitsai`
- `bytedance-bam`
- `bytedance-bmq`
- `bytedance-bytetech`
- `bytedance-cache`
- `bytedance-cloud-docs`
- `bytedance-cloud-ticket`
- `bytedance-codebase`
- `bytedance-cronjob`
- `bytedance-dataq`
- `bytedance-dkms`
- `bytedance-dorado`
- `bytedance-env`
- `bytedance-es`
- `bytedance-feishu`
- `bytedance-goofy-deploy`
- `bytedance-hive`
- `bytedance-iam`
- `bytedance-kmsv2`
- `bytedance-log`
- `bytedance-netlink`
- `bytedance-neptune`
- `bytedance-overpass`
- `bytedance-rds`
- `bytedance-scm`
- `bytedance-settings`
- `bytedance-slardar-web`
- `bytedance-tcc`
- `bytedance-tce`
- `bytedance-tika`
- `bytedance-tos`

`bytedcli` 统一 skill 还覆盖当前没有独立分域 skill 的命令域，例如 `agw`、`aime`、`bytecloud`、`bytedoc`、`fornax`、`meego`、`tqs`、`mcp`、`update`。

## 如何使用 bytedcli MCP

当 CLI 和 skill 都不方便用，或者你需要把 bytedcli 暴露成标准 MCP tools 时，再使用 MCP。

`bytedcli` 自带 MCP server，启动命令是：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest mcp
```

### Codex

```bash
codex mcp add bytedcli \
  --env NPM_CONFIG_REGISTRY=http://bnpm.byted.org \
  -- npx -y @bytedance-dev/bytedcli@latest mcp
```

### Claude Code

```bash
claude mcp add bytedcli \
  --env NPM_CONFIG_REGISTRY=http://bnpm.byted.org \
  -- npx -y @bytedance-dev/bytedcli@latest mcp
```

### OpenClaw

如果 OpenClaw 支持标准 stdio MCP server，把下面这条命令注册进去即可：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest mcp
```

### MCP 使用约定

- MCP tool 基于 Commander 命令树自动生成
- 新增 CLI 命令后，通常无需单独写一套 MCP tool
- 当前 tool 名统一使用下划线格式，例如 `bytedcli_auth_status`

## bytedcli 有哪些功能

核心能力覆盖：

- 认证与身份：SSO 认证、IAM、DKMS、KMS v2
- 协作与知识：Feishu / Lark、Cloud Docs、Cloud Ticket、ByteTech、BitsAI、AIME、Meego、Fornax
- 代码与发布：Codebase、BAM、AGW、Bits、SCM、Goofy、Overpass
- 云平台与环境：ByteCloud、TCE、TCC、ENV、Cronjob、Netlink、Neptune、Settings
- 数据与存储：TOS、RDS / BPM、ByteDoc、Cache、Hive、Aeolus、Dorado、TQS、BMQ
- 可观测：日志、APM、ES、Slardar Web

## 给 agent 的建议执行顺序

1. 先判断任务是否属于 bytedcli 覆盖域。
2. 能直接走 CLI 时，优先走 CLI。
3. CLI 不方便用，但能直接读取 `website/SKILL.md` 或安装 `skills/` 里的 skill pack 时，再走 skill。
4. skill 也不方便用，但支持标准 MCP 时，再走 MCP。
5. 需要稳定解析时使用 `--json`。
6. 先做 `auth status`，再调用需要鉴权的命令。
7. 不确定参数时先 `--help`。
8. 输出时总结关键信息，不直接倾倒原始返回。
9. Feishu `im message send/reply`、`im image upload`、`im file upload` 使用应用身份（`tenant_access_token`），不走用户 OAuth scope。发图片/文件/视频需先 upload 获取 key 再 send。

## 参考资料

- 飞书文档：<https://bytedance.larkoffice.com/docx/PRoSdJR8NowW5gxguFGcm9HpnRb>
- 仓库：<https://code.byted.org/byteapi/bytedcli>
