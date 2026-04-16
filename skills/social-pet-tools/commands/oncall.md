# Oncall Command

> **引用规范**：`../references/conventions.md`、`../references/mapping.md`

## Trigger

- `oncall`
- “处理 social-pet oncall”
- “看一下这个告警是不是 social_pet 的问题”
- “帮我先接一下这个事故”
- “有个线上异常，帮我分流一下”

## 目标

为 `social_pet` 相关 oncall 任务提供一个保守的统一入口：

- 先收敛事实
- 再判断应该进入哪个已沉淀的子命令或旧 skill
- 不在聚合层凭空发明一套不存在的 oncall 流程

## 输入

- 告警或事故摘要
- 环境信息
- 时间范围
- 请求体、响应体、`log_id`、pod、实例、错误日志中的任一证据
- 是否已经有代码改动、配置改动或回滚动作

如果只有一句“有问题了”，先补齐最小事实，不要直接猜根因。

## 分流规则

1. 如果已经有明确请求，且要沿 `request -> response -> log_id/pod -> instance log -> Mongo/Redis` 链路排查，优先路由到 `rpc-pod-triage`，并按 `references/mapping.md` 回退到旧 `social-pet-rpc-pod-triage`。
2. 如果问题本质是 `ppe_*` 配置修改、修错配置或补提交流程，路由到 `config-modify`。
3. 如果已经做了代码改动，需要进入“本地测试 -> RPC 验证 -> 修复 -> 重试”的闭环，路由到 `local-test` 或后续 `rpc-verify`。
4. 如果旧 `social-pet-oncall` 后续补齐了可执行细节，优先回退到该旧 skill；当前聚合层不要脑补不存在的 oncall 模板。

## 证据落盘

产物落盘到当前 session 的 `oncall/` 子目录（详见 `../references/conventions.md` "证据落盘路径规范（AI 审计目录）"）：

```
docs/social-pet/<date-topic>/oncall/
```

每次 oncall 受理至少保留：

- `verdict.md` — 事实摘要、分流决策、证据索引
- 相关请求体、回包、日志片段按需保存

后续路由到的子命令，产物落盘到同一 session 下各自子目录（如 `rpc-pod-triage/`）。

## 返回给用户

- 当前 oncall 事实摘要
- 已拿到的关键信息和证据落盘路径
- 建议进入的下一条命令
- 还缺哪些最小输入
- 暂不建议执行的动作（如果事实不足）

## 约束

- 不在事实不足时直接下根因结论
- 不在聚合层虚构升级、回滚、止血模板
- 优先复用已存在的专用命令或旧 `social-pet-*` skill
- `social-pet-oncall` 当前若仍无细节沉淀，本命令只做受理与分流，不做重流程承诺
