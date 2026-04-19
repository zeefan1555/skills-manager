# RPC Pod Triage Command

> **命令类型**：`shared`
>
> **典型调用方**：`../workflows/goal-rpc-loop.md`

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

至少保存：

- 请求文件路径
- 回包文件路径
- 本次使用的环境参数

### 第 2 步：从回包提取定位锚点

必须优先提取：

- `log_id`
- `pod_name`
- `request_address`
- `resp_body` 或 `resp_body_json`

### 第 3 步：优先查实例日志

日志检查顺序：

1. 优先命中实例日志
2. 再看 lane / logid 日志
3. 最后才做更宽泛的关键词搜索

### 第 4 步：必要时补查外部状态

只有在回包和实例日志还不能解释结果时，才扩展到：

- Mongo
- Redis
- 下游回调记录
- 生成资源或存储对象

### 第 5 步：输出单次 bundle

最终把本次排障证据收敛到当前 session 的 `rpc-pod-triage/` 子目录：

```text
docs/social-pet/<date-topic>/rpc-pod-triage/
```

主流程派发 shared 前必须显式传入：

- 当前 session 绝对路径
- 当前 shared 输出目录绝对路径
- 允许写入的白名单根目录

硬约束：

- 所有产物必须直接写入当前 session 的 `rpc-pod-triage/`
- 不允许先写到 session 外再搬回
- 若已验证到关键断言，必须通过结构化字段回传给 controller，而不是只写自然语言

`verdict.md` 至少包括：

- 请求文件路径
- 回包文件路径
- `log_id`
- `pod_name`
- 关键实例日志片段
- Mongo / Redis 关键状态
- 一句话结论
- 下一步建议

如果本命令需要把结果回交 `goal-rpc-loop` controller，建议补一份结构化结果，至少包含：

```json
{
  "shared_command": "rpc-pod-triage",
  "blocking_cleared": true,
  "key_evidence": [
    "rpc-pod-triage/logid-full.txt"
  ],
  "recommended_return_phase": "rpc-first-pass",
  "acceptance_inputs": [
    {
      "assertion_id": "assert-example",
      "assertion_text": "示例断言",
      "status": "PASS",
      "evidence": [
        "file:///absolute/path/to/logid-full.txt#L40-L42"
      ],
      "notes": ""
    }
  ]
}
```

## 收口规则

只有同时满足以下条件，才算本命令完成：

- 已保存本次请求和回包
- 已提取出 `log_id` 或其他足够稳定的定位锚点
- 已给出实例日志层面的事实判断
- 如有需要，已补充 Mongo / Redis / 下游证据
- 已输出单次 bundle 路径和一句话根因
- 若已命中用户关心的运行时断言，已通过 `acceptance_inputs` 把证据回填给 controller
