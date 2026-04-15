---
name: social-pet-rpc-pod-triage
description: Use when在 social_pet 仓库中，已经有一个明确 RPC 请求，想按“请求体 -> 回包 -> log_id/pod -> 实例日志 -> Mongo/Redis”这条链快速定位为什么接口结果没生效时使用。
license: MIT
compatibility: Requires the social_pet repository layout and bytedcli access to ByteDance internal RPC, TCC, log, cache, and bytedoc endpoints.
metadata:
  author: Trae
  version: "1.1"
---

# Social Pet RPC Pod 排障

只用于 `social_pet` 仓库。它不是做全量接口验证，也不是做多 case 报告，而是针对**一个已经明确的请求**，把“请求体、回包、`log_id`、命中 pod、实例日志、Mongo/Redis 状态”串成一条固定排障链，快速回答：

- 这次请求到底命中了哪个实例
- 服务侧走到了哪一层
- 为什么没有触发更新/发送消息/回调/落库

## 何时使用

- 已经有一个明确 RPC，例如 `UpdateWidget`、`GetWidget`
- 已经有现成请求体，或只需要构造一个最小请求体
- 用户不是要做完整回归，而是要查“为什么这次没生效”
- 用户提到：
  - “看这次请求为什么没触发”
  - “帮我按 pod 日志查”
  - “把请求、返回、日志串起来定位原因”
  - “为什么 `needUpdate=false` / 为什么没发消息 / 为什么没落库”

不要用于：

- 需要覆盖多个 RPC、多个 case 的完整验证
- 还没明确具体请求、还在做需求分析
- 只需要本地单测

## 核心原则

- **先保存请求和回包，再看日志**
- **先从回包提取 `log_id` 和 `pod_name`，不要盲搜整站日志**
- **优先查实例日志，不优先依赖 `get-logid-log` 摘要**
- **先判定“有没有进入分支”，再判定“分支结果对不对”**
- **把请求、返回、实例日志、Mongo/Redis 证据放到同一个 bundle 文件**

## 固定流程

### 1. 固定输入

至少准备：

- 一个请求体文件，例如 `docs/rpc-verify/artifacts/update_widget_case1_round2_req.json`
- 一套固定环境参数，参考 `refs/triage-checklist.md`

### 2. 发送 RPC 并保存原始返回

把返回保存为独立文件，不要只在终端看一眼。

### 3. 从回包提取关键字段

必须提取：

- `log_id`
- `pod_name`
- `request_address`
- `resp_body`

如果没有 `pod_name`，也要先拿到 `log_id`，再去日志里反查实例。

### 4. 优先查实例日志

对 `ppe_tab_template` 这类 lane 环境，优先使用：

- `log get-lane-instance-log`

不要先靠 `search-psm-log` 猜关键词，因为：

- 实例日志更稳定
- 新加的 `CtxDebug` 更容易在实例日志里命中
- 可以把日志范围限制在单个时间窗

### 5. 针对本次 UpdateWidget 的特化排查

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

### 6. 如涉及资源/回调，再查 Mongo 和 Redis

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

### 7. 产出单次 bundle

最后把下面 4 类证据放进一个文件：

- 请求体
- 原始回包
- 关键实例日志
- 结论

模板见：

- `templates/rpc-pod-triage-bundle.md`

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

## 常见误判

- 看到 `BaseResp.StatusCode=0` 就以为业务链路成功
- 看到 `SendBatch success` 就以为下游一定消费成功
- 只查 `search-psm-log`，不查命中 pod 的实例日志
- 把“没有 `WidgetEventDebug`”误判成“发送失败”
- 把“`currentSign` 包含 401/402/403”误判成“最新版本已经生成成功”
- 把 `CDS配置获取失败` 误判成“下游没回调”
- 把 `WidgetProgress` 最终为空误判成“Redis 没写成功”

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
