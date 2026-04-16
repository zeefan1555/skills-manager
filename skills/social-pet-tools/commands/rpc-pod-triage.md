# RPC Pod Triage Command

> **引用规范**：`../references/conventions.md`、`../references/mapping.md`、旧 skill `social-pet-rpc-pod-triage`

## Trigger

- `rpc-pod-triage`
- “按 pod 日志链路查这次请求为什么没生效”
- “帮我把请求、回包、log_id、实例日志串起来定位”
- “这次 RPC 到底打到了哪个实例”
- “为什么没发消息 / 没落库 / 没更新 Redis”

## 目标

针对一个已经明确的 RPC 请求，沿固定链路快速回答“为什么这次请求没得到预期结果”：

1. 固化本次请求体与回包
2. 从回包提取 `log_id`、`pod_name`
3. 优先查看命中实例的日志
4. 必要时补查 Mongo / Redis / 下游状态
5. 输出单次排障 bundle 与一句话结论

## 输入

至少要有以下输入之一：

- 现成请求体文件
- 已保存的响应文件
- 明确的 method 名与最小请求参数
- 已知的 `log_id`

同时尽量确认：

- `psm`、`control_plane`、`idc`、`env`、`zone`、`cluster`
- `idl_source`、`idl_version`
- 预期行为是什么，当前“不生效”具体指哪个结果没出现

如果用户只说“这次不对”，先补齐最关键的缺口：

- 哪个 RPC
- 这次请求体是什么
- 预期应该发生什么

## 固定链路

默认按这条链排障，不随意跳步：

1. request
2. raw response
3. `log_id` / `pod_name`
4. instance log
5. Mongo / Redis / downstream state
6. `verdict.md`

约束：

- 先保存请求和回包，再看日志
- 先从回包提取定位信息，不盲搜日志
- 先判断“有没有进入目标分支”，再判断“分支结果对不对”

## 执行步骤

### 第 1 步：落盘请求体与原始回包

不要只在终端看一眼结果。至少保存：

- 请求文件路径
- 回包文件路径
- 本次使用的环境参数

如果还没发 RPC，可复用旧 skill 中的命令模板或检查清单先补发一次。

### 第 2 步：从回包提取定位锚点

必须优先提取：

- `log_id`
- `pod_name`
- `request_address`
- `resp_body` 或 `resp_body_json`

如果没有 `pod_name`：

- 先保留 `log_id`
- 再通过日志反查实例

### 第 3 步：优先查实例日志

日志检查顺序：

1. 优先命中实例日志
2. 再看 lane / logid 日志
3. 最后才做更宽泛的关键词搜索

目标不是“多看日志”，而是先回答：

- 请求有没有真正进入目标服务
- 有没有走到目标分支
- 卡在哪一层

### 第 4 步：必要时补查外部状态

只有在回包和实例日志还不能解释结果时，才扩展到：

- Mongo
- Redis
- 下游回调记录
- 生成资源或存储对象

检查外部状态时，优先围绕本次请求相关的会话、版本、资源 ID 收敛，不做无界搜索。

### 第 5 步：输出单次 bundle

最终把本次排障证据收敛到当前 session 的 `rpc-pod-triage/` 子目录（详见 `../references/conventions.md` "证据落盘路径规范（AI 审计目录）"）：

```
docs/social-pet/<date-topic>/rpc-pod-triage/
```

`verdict.md` 至少包括：

- 请求文件路径
- 回包文件路径
- `log_id`
- `pod_name`
- 关键实例日志片段
- Mongo / Redis 关键状态
- 一句话结论
- 下一步建议

## 何时回退到旧 skill

遇到以下情况，直接读取旧 skill `social-pet-rpc-pod-triage`：

- 需要方法特化的排查关键词，例如 `UpdateWidgetDebug`
- 需要复用既有 `refs/triage-checklist.md`
- 需要复用 `templates/rpc-pod-triage-bundle.md`
- 需要沿用既有 Mongo / Redis 查询命令和实战判定经验

聚合命令只保留稳定主链，不复制旧 skill 的特化业务知识。

## 推荐返回结构

- 本次请求的基本信息
- 命中的 `log_id` / `pod_name`
- 关键日志结论
- 外部状态结论
- 根因判断与下一步

## 常见错误

- 没有请求体和回包文件，就直接开始猜日志
- 只查摘要日志，不查命中实例的日志
- 看到 `BaseResp.StatusCode=0` 就认为链路成功
- 还没确认请求是否进入目标分支，就直接下结论说“发送失败”
- Redis 最终为空时，直接误判成“处理没发生”

## 收口规则

只有同时满足以下条件，才算本命令完成：

- 已保存本次请求和回包
- 已提取出 `log_id` 或其他足够稳定的定位锚点
- 已给出实例日志层面的事实判断
- 如有需要，已补充 Mongo / Redis / 下游证据
- 已输出单次 bundle 路径和一句话根因
