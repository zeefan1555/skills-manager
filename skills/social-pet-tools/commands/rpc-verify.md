# RPC Verify Command

> **引用规范**：`../references/conventions.md`、`../references/mapping.md`、旧 skill `social-pet-rpc-verify-loop`、旧 skill `social-pet-local-test`

## Trigger

- `rpc-verify`
- “改完代码后继续 RPC 验证”
- “帮我自己构造请求，用 bytedcli 打一下受影响接口”
- “单测过了，再帮我把真实 RPC 跑一轮”
- “如果返回不对，就继续修复再重试”

## 目标

在 `social_pet` 仓库中完成“本地单测 -> RPC 调用 -> 返回校验 -> 修复后重试”的验证闭环：

1. 找出本次改动影响的 RPC
2. 先完成本地测试
3. 为每个受影响 RPC 构造最小必要请求体
4. 用真实环境参数执行 `rpc-call`
5. 校验关键返回字段和 `log_id`
6. 如果结果不对，进入下一轮定位与复测

## 输入

优先收集这些输入：

- 当前改动范围或目标文件
- 受影响的 RPC / method，或需要一起回溯的旁路接口
- 本次验证环境参数
- 是否已有请求模板
- 关键断言字段与预期值

如果用户描述较模糊，先补齐：

- 改动到底影响哪个 RPC
- 验证目标字段是什么
- 本次要打哪个环境

## 固定约束

- 本地测试阶段复用旧 skill `social-pet-local-test`
- 需要 `test-driven-development` 时，本地测试仍遵循 `social-pet-local-test` 的执行与校验方式
- 所有请求、回包、日志、报告默认落盘，不只依赖终端输出
- 默认串行执行 RPC，避免同一终端多个 `rpc-call` 相互覆盖

## 执行步骤

### 第 1 步：先收敛受影响 RPC

优先基于当前改动去回溯：

- 对外 RPC 入口
- 共用 helper 影响到的旁路接口
- 至少一个成功 case 和一个关键失败 case

如果需要更完整的回溯方法、基线分支定义或共享逻辑判定，回退到旧 skill `social-pet-rpc-verify-loop`。

### 第 2 步：先跑本地单测

本阶段不要自己发明测试流程，直接复用旧 skill `social-pet-local-test`：

- 先 `sh build.sh`
- 再 `./ci/run.sh '<TestRegex>'`
- 必须校验目标测试函数在日志中的 `=== RUN` / `--- PASS:` / `--- FAIL:`

没有完成本地单测前，不要直接把问题推给 RPC 返回。

### 第 3 步：准备统一的 RPC 调用参数

把本次共用的参数收敛成一套固定配置：

- `PSM`
- `Control Plane`
- `Env`
- `IDL Source`
- `IDL Version`
- `IDC`
- `Zone`
- `Cluster`

如果环境参数容易混淆，优先回读旧 skill 中的 `refs/rpc-call-options.md`，不要边跑边猜。

### 第 4 步：为每个 RPC 构造最小必要请求体

构造原则：

- 先看 IDL 的 required 字段
- 再补代码真正读取到的最小字段
- 优先最小请求，不一开始就抄整份客户端包
- 如果 case 依赖白名单或实验，先确认当前配置，再决定是否调整

每个请求体都应独立保存，避免下一轮覆盖上一轮证据。

### 第 5 步：串行执行 RPC 并校验返回

对每个 case：

- 执行 `bytedcli api-test rpc-call`
- 保存原始输出文件
- 提取 `log_id`
- 校验关键业务字段，而不是只看最外层成功状态

如果请求存在前后依赖，例如先 `UpdateWidget` 再 `GetWidget`：

- 必须顺序执行
- 不要并发跑

### 第 6 步：返回不对时进入循环

排查顺序保持稳定：

1. 请求是否真的走到目标 RPC
2. 是否进入目标分支
3. 是否是请求字段不足
4. 是否是环境代码未更新
5. 是否是业务逻辑 bug

如果需要继续修复：

- 先回代码定位
- 再重新跑本地测试
- 再重发同一批关键请求

## 报告与证据

产物落盘到当前 session 的 `rpc-verify/` 子目录（详见 `../references/conventions.md` "证据落盘路径规范（AI 审计目录）"）：

```
docs/social-pet/<date-topic>/rpc-verify/
```

每次执行至少保留：

- `NN-req-<method>.json` — 请求体（按执行顺序编号）
- `NN-resp-<method>.json` — RPC 原始回包
- `verdict.md` — AI 判定（含 `log_id`、关键字段校验、结论）

多轮重试的请求和回包按编号递增，`verdict.md` 中记录每轮结果。


## 何时回退到旧 skill

遇到以下情况，直接读取旧 skill `social-pet-rpc-verify-loop`：

- 需要更完整的“影响 RPC 回溯”方法
- 需要复用 `refs/rpc-call-options.md`
- 需要沿用按阶段写报告的结构
- 需要更细的环境阻塞判定、TCC 白名单准备或方法级实战经验

## 推荐返回结构

- 受影响 RPC 清单
- 本地测试结果与证据路径
- 每个 RPC 的请求体和关键回包结论
- `log_id` 与失败归因
- 下一轮修复或复测建议

## 常见错误

- 没跑本地单测就直接开始打 RPC
- 只验证一个主路径接口，漏掉共享逻辑影响的旁路 RPC
- 请求体一开始就过度复制客户端原包，导致难以排查
- 只看 RPC 调用成功，不看关键返回字段
- 字段缺失时，不先查 `log_id` 就直接判断“代码没生效”
- 明明环境还没更新，却继续补请求体浪费时间

## 收口规则

只有同时满足以下条件，才算本命令完成：

- 已明确本次验证覆盖的 RPC 范围
- 已完成本地测试，并基于日志校验结果
- 至少一轮关键 RPC 已真实调用并保存证据
- 已输出当前是否通过、失败点在哪、下一步怎么做
