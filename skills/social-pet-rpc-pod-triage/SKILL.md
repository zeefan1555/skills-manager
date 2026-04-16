---
name: social-pet-rpc-pod-triage
description: Use when在 social_pet 仓库中，已经有一个明确 RPC 请求，需要按“请求体 -> 回包 -> log_id/pod -> 实例日志 -> Mongo/Redis”排障，并希望沉淀请求历史、复用上次记录或对比新旧结果时使用。
license: MIT
compatibility: Requires the social_pet repository layout and bytedcli access to ByteDance internal RPC, TCC, log, cache, and bytedoc endpoints.
metadata:
  author: Trae
  version: "1.2"
---

# Social Pet RPC Pod 排障

只用于 `social_pet` 仓库。它不是做全量接口验证，也不是做多 case 报告，而是针对**一个已经明确的请求**，把“请求体、回包、`log_id`、命中 pod、实例日志、Mongo/Redis 状态”串成一条固定排障链，快速回答：

- 这次请求到底命中了哪个实例
- 服务侧走到了哪一层
- 为什么没有触发更新/发送消息/回调/落库
- 上一次同类请求发生了什么，这次和上次相比变了什么

## 何时使用

- 已经有一个明确 RPC，例如 `UpdateWidget`、`GetWidget`
- 已经有现成请求体，或只需要构造一个最小请求体
- 用户不是要做完整回归，而是要查“为什么这次没生效”
- 用户提到：
  - “看这次请求为什么没触发”
  - “帮我按 pod 日志查”
  - “把请求、返回、日志串起来定位原因”
  - “为什么 `needUpdate=false` / 为什么没发消息 / 为什么没落库”
  - “这次和上次比有什么变化”
  - “上次同一个请求的结论还能不能复用”

不要用于：

- 需要覆盖多个 RPC、多个 case 的完整验证
- 还没明确具体请求、还在做需求分析
- 只需要本地单测

## 核心原则

- **先查历史索引，再决定是否重放**
- **先保存请求和回包，再看日志**
- **先从回包提取 `log_id` 和 `pod_name`，不要盲搜整站日志**
- **优先查实例日志，不优先依赖 `get-logid-log` 摘要**
- **先判定“有没有进入分支”，再判定“分支结果对不对”**
- **把请求、返回、实例日志、Mongo/Redis 证据放到同一个 bundle 文件**
- **每次请求都必须沉淀可复用产物**
- **每次完成后都必须向历史索引追加一条记录**

## 历史沉淀模型

### 1. 运行目录

每次执行都写入独立运行目录：

- `docs/test/log/run-YYYYMMDDTHHMMSS/`

同一次执行至少保存：

- `request.json`
- `response.json`
- `parsed_summary.json`
- `instance_log.txt` 或 `logid_trace.txt`
- `bundle.md`

### 2. 历史索引

每次 triage 完成后，向下面的索引追加一条 JSON 行：

- `docs/rpc-verify/history/index.jsonl`

最少字段：

- `run_id`
- `timestamp`
- `method`
- `env`
- `psm`
- `user_id`
- `conversation_short_id`
- `aid`
- `device_id`
- `request_fingerprint`
- `status_code`
- `log_id`
- `pod_name`
- `request_address`
- `conclusion`
- `next_action`
- `request_path`
- `response_path`
- `summary_path`
- `bundle_path`

### 3. 请求指纹

每次请求都要生成 `request_fingerprint`，用于下次复用。

建议输入：

- RPC 方法名
- 环境
- `UserId`
- `ConversationShortID`
- `Aid`
- `DeviceId`
- 规范化后的请求体 JSON

建议规则：

- 对 JSON key 排序
- 忽略纯说明性字段
- 保留业务有效字段
- 输出稳定短 hash，如 SHA256 前缀

### 4. Case Key

为了方便人看历史，额外生成一个可读分组键：

- `<Method>__<env>__uid<user_id>__conv<conversation_short_id>`

它用于浏览，不用于去重。

## 固定流程

### 1. 固定输入

至少准备：

- 一个请求体文件，例如 `docs/rpc-verify/artifacts/update_widget_case1_round2_req.json`
- 一套固定环境参数，参考 `refs/triage-checklist.md`

### 2. 先把请求落盘到本次运行目录

不要只在消息里持有请求体，先把请求写入：

- `docs/test/log/run-<timestamp>/request.json`

### 3. 先检索历史

在真正重放 RPC 之前，必须：

1. 解析请求体中的关键字段
2. 生成 `request_fingerprint`
3. 搜索 `docs/rpc-verify/history/index.jsonl`

匹配优先级：

1. 完全相同的 `request_fingerprint`
2. 相同的 `case_key`
3. 相同的 `method + env + conversation_short_id`

### 4. 决定复用还是重放

如果命中完全相同的 `request_fingerprint`：

- 先展示上次结论
- 先展示上次证据路径
- 默认把上次 run 作为 baseline
- 再决定是否重放当前请求

如果只命中同 case 的历史：

- 复用最近一次同 case 作为 baseline
- 本次执行后输出 delta

如果没有历史：

- 走标准 live triage

### 5. 发送 RPC 并保存原始返回

把返回保存为独立文件，不要只在终端看一眼。

### 6. 从回包提取关键字段

必须提取：

- `log_id`
- `pod_name`
- `request_address`
- `resp_body`

如果没有 `pod_name`，也要先拿到 `log_id`，再去日志里反查实例。

同时把结构化摘要写入：

- `docs/test/log/run-<timestamp>/parsed_summary.json`

### 7. 优先查实例日志

对 `ppe_tab_template` 这类 lane 环境，优先使用：

- `log get-lane-instance-log`

不要先靠 `search-psm-log` 猜关键词，因为：

- 实例日志更稳定
- 新加的 `CtxDebug` 更容易在实例日志里命中
- 可以把日志范围限制在单个时间窗

### 8. 针对本次 UpdateWidget 的特化排查

如果目标 RPC 是 `UpdateWidget`，优先 grep 这些关键前缀：

- `UpdateWidgetDebug][WhiteList`
- `UpdateWidgetDebug][ABOrWhiteList`
- `UpdateWidgetDebug][AB]`
- `UpdateWidgetDebug][SignCheck`
- `UpdateWidgetDebug][NeedUpdateResult`
- `WidgetEventDebug`

#### 结果判定规则

1. **`checkWhiteList=[]`**
   - 说明实例侧当前读到的 TCC 没有这条白名单
   - 优先怀疑 TCC 未刷新到实例，而不是业务逻辑问题

2. **`abOrWhiteListHit=false`**
   - 签名分支虽然可能会打印 `expectedSign/currentSign`
   - 但不会触发 `needUpdate=true`

3. **`needUpdate=false updateResult=Consistent`**
   - 当前请求没有触发更新
   - 不会进入 `Produce`
   - 不会进入 `SendCreateWidgetEvents`

4. **没有 `WidgetEventDebug`**
   - 不是发送失败
   - 更可能是根本没走到发送逻辑

5. **回包报 `CDS配置获取失败` / 日志出现 `GetSarWidgetResCfgAll(xxx) return nil`**
   - 说明请求已经走到 `Produce` / `Store` / `SendCreateWidgetOrder`
   - 当前不是 TCC / 白名单 / AB 问题
   - 优先去查当前环境缺失的 CDS 配置项是否已发布、实例是否已读到最新配置

6. **有 `WidgetEventDebug` 且 `SendBatch success`**
   - 说明应用层消息已发出
   - 下一步去查下游回调、Mongo、`GetWidget`

### 9. 如涉及资源/回调，再查 Mongo 和 Redis

固定查这两层：

- Mongo：`social_pet_widget`
- Redis：`WidgetProgress:<convID>:<version>`

如果：

- `SendBatch success`
- Mongo 没有新版本资源
- Redis 没有新版本 progress

则优先怀疑：

- 云渲染服务未部署到当前环境
- 或回调链路未对到当前环境

但要特别注意：

- `WidgetProgress` 是**临时进度 key**
- 它会在 `ProcessComplete` 成功后被 `delWidgetProgress` 删除
- 所以如果实例日志里已经出现：
  - `addWidgetProgress success`
  - `HGetAllWidgetProgress ... widgetCfgCount=<N>`
  - `ProcessComplete success`
  - `delWidgetProgress ... success`
- 那么此时再手工 `HGETALL` 返回 `{}` 是**预期行为**
- 不要把“完成后 Redis 为空”误判成“渲染没写进去”

最终成功判据优先看：

- Mongo 是否有目标版本的新资源
- `GetWidget` 是否返回目标版本的 `RenderState=Completed` 和非空 `AniUrl`

### 10. 产出单次 bundle

最后把下面 4 类证据放进一个文件：

- 请求体
- 原始回包
- 关键实例日志
- 结论

模板见：

- `templates/rpc-pod-triage-bundle.md`

### 11. 追加历史索引

bundle 完成后，必须向 `docs/rpc-verify/history/index.jsonl` 追加一条记录。

要求：

- 不覆盖旧记录
- 相同请求允许多次出现
- 每条记录都能回跳到本次 `request.json`、`response.json`、`bundle.md`

### 12. 输出历史对比

如果本次命中过历史 baseline，最终结论里必须补充：

- baseline run id
- 上次结论
- 本次相对上次新增或变化的字段
- 当前行为是“改善 / 回归 / 无变化”

## 推荐输出

建议 bundle 至少包含：

1. 请求体路径
2. 返回体路径
3. `log_id`
4. `pod_name`
5. 实例日志关键片段
6. Mongo / Redis 关键状态
7. 结论：
   - 没命中白名单
   - 没触发 needUpdate
   - 没进入消息发送
   - 已发送但未回调
   - 已回调但未落库
8. 历史命中情况：
   - 是否命中完全相同请求
   - 是否命中同 case 历史
   - baseline 是哪一次 run
9. 与 baseline 的差异：
   - 回包差异
   - 日志差异
   - 存储状态差异

## 常见误判

- 看到 `BaseResp.StatusCode=0` 就以为业务链路成功
- 看到 `SendBatch success` 就以为下游一定消费成功
- 只查 `search-psm-log`，不查命中 pod 的实例日志
- 命中历史后直接复述旧结论，不重看当前请求和新回包
- 只保存 `bundle.md`，不保存原始 `request/response`
- 新请求执行完了，但没把记录写入 `index.jsonl`
- 把“没有 `WidgetEventDebug`”误判成“发送失败”
- 把“`currentSign` 包含 401/402/403”误判成“最新版本已经生成成功”
- 把 `CDS配置获取失败` 误判成“下游没回调”
- 把 `WidgetProgress` 最终为空误判成“Redis 没写成功”

## 复用判定

### 直接复用上次记录

满足以下条件时，优先展示上次结果，再询问是否需要重放：

- 完全相同的 `request_fingerprint`
- 用户只是问“上次这条请求结果是什么”
- 当前目标是快速回看，不是验证新配置或新代码

### 必须重放当前请求

满足以下任一条件时，不要只复用旧结论：

- 用户明确说“我已经改过了，再打一次”
- CDS / TCC / 白名单 / AB / 部署已变化
- 需要拿到新的 `log_id`
- 需要确认当前回包是否已经变化

### 复用方式

即使重放，也要复用上次记录作为 baseline，而不是丢掉历史上下文。

## 本次 UpdateWidget 实战收敛

这次真实排查里，链路分了 3 个阶段：

### 阶段 1：TCC 没生效，根本没进入发送链

- 实例日志里 `checkWhiteList=[]`
- `whiteListHit=false`
- `abResult=map[]`
- `abOrWhiteListHit=false`
- `expectedSign=401,402`
- `currentSign=401,402,403`
- `needUpdate=false updateResult=Consistent`
- `WidgetEventDebug` 无命中

它说明：

- 当前不是消息发送失败
- 而是实例没有读到白名单，导致请求根本没进入发送链路

### 阶段 2：TCC 生效了，但 CDS 缺配置卡在应用侧

- `whiteListHit=true`
- `abOrWhiteListHit=true`
- `needUpdate=true updateResult=NewIDCfgChanged`
- `Produce` / `Store` 已执行
- 回包 `BaseResp.StatusCode=101001`
- 日志出现 `GetSarWidgetResCfgAll(xuanyun) return nil`

它说明：

- 当前不是 TCC 问题
- 也不是下游回调问题
- 而是应用层发送前缺 CDS 资源配置

### 阶段 3：CDS 补齐后整条链路打通

- `SendBatch success`
- 同一个 `log_id` 下出现 `CompleteWidgetRender`
- Mongo 落到目标版本新资源
- `WidgetProgress` 在渲染中逐步增加
- `ProcessComplete success`
- `delWidgetProgress ... success`
- `GetWidget` 返回 `RenderState=Completed` 和非空 `AniUrl`

它说明：

- 整条 `UpdateWidget -> EventBus -> CompleteWidgetRender -> Mongo -> GetWidget` 链路已经打通
- 最终态不要再拿 Redis progress 是否存在作为成功标准
