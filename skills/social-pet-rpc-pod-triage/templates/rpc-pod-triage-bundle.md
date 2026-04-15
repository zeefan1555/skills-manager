# RPC Pod 排障 Bundle

## 基本信息

- 目标 RPC：`<MethodName>`
- 请求文件：`<request-file>`
- 返回文件：`<response-file>`
- `log_id`：`<log-id>`
- `pod_name`：`<pod-name>`
- 时间窗：`<start> ~ <end>`

## 请求体

```json
<request-json>
```

## 原始返回

```json
<response-json>
```

## 实例日志关键片段

### 判定链

```text
<UpdateWidgetDebug WhiteList / ABOrWhiteList / AB / SignCheck / NeedUpdateResult>
```

### 发送链

```text
<WidgetEventDebug / SendCreateWidgetEvents / SendBatch>
```

### 回调/落库链（如有）

```text
<CompleteWidgetRender / ProcessComplete / GetWidgetDebug>
```

## Mongo / Redis 状态

### Mongo

```json
<mongo-result>
```

### Redis

```json
<redis-result>
```

Redis 解释：

- `WidgetProgress:<convID>:<version>` 只表示**当前版本的临时渲染进度**
- 如果实例日志里已经出现：
  - `addWidgetProgress success`
  - `ProcessComplete success`
  - `delWidgetProgress ... success`
- 那么此时 Redis 查到 `{}` 是**正常现象**
- 不要把“最终查 Redis 为空”误判成“渲染没成功”

## 结论

- 是否命中白名单：`是/否`
- 是否命中 AB：`是/否`
- 是否进入签名比较：`是/否`
- 是否 `needUpdate=true`：`是/否`
- 是否进入消息发送：`是/否`
- 是否 `SendBatch success`：`是/否`
- 是否有回调：`是/否`
- 是否命中过 `CDS配置获取失败`：`是/否`
- 是否有新版本落库：`是/否`
- Redis progress 当前是否存在：`是/否`
- Redis progress 为空是否属于完成后删除：`是/否`

最终判断：
- `<一句话根因>`

下一步：
- `<next-step-1>`
- `<next-step-2>`

## 常见收敛句式

- `<根因>`：实例没读到白名单，当前请求根本没进入发送链路
- `<根因>`：当前环境缺 CDS 配置，卡在 `SendCreateWidgetOrder`
- `<根因>`：应用层已发送，但下游回调未返回，优先看云渲染部署或回调环境
- `<结论>`：整条链路已打通，Redis progress 已在 `ProcessComplete` 后被正常删除
