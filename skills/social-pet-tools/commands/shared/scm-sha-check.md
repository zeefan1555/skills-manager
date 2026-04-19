# SCM SHA Check Command

> **命令类型**：`shared`
>
> **典型调用方**：`../workflows/goal-rpc-loop.md`、`../phases/rpc-gap-loop.md`
>
> **参考证据**：`../../references/evidence/2026-04-19-doushan-rpc-shape-and-scm-sha/index.md`

## Trigger

- `scm-sha-check`
- `scm sha check`
- `base_commit_hash`
- “先核对线上版本里有没有这次提交”
- “检查实例 version 对应的 SCM version 和 base_commit_hash”
- “别先猜部署没生效，先做 SCM SHA 核对”

## 定位

这是 `goal-rpc-loop` 借用的 `shared worker`，只负责回答“当前命中的线上版本，是否真的包含本地这份代码”。

- 它不负责替主流程决定下一阶段
- 它不直接处理发版、回滚或部署动作
- 它的完成标准是把“实例 version -> SCM version -> base_commit_hash -> 本地 HEAD”这条证据链串完整

执行完后，控制权必须回到 `goal-rpc-loop` controller，由主流程决定：

- 回到 `rpc-gap-loop` 继续收敛
- 转入 `rpc-pod-triage` 看运行时事实
- 还是交给发版 / 部署链路继续处理

## 目标

在真正怀疑“部署没生效”或“线上实例没带上这次代码”之前，先回答下面四个问题：

1. 真实命中的实例版本是什么
2. 这个实例版本对应的 SCM version 是什么
3. 这个 SCM version 对应的 `base_commit_hash` 是什么
4. 本地当前 `HEAD` 是否与该 `base_commit_hash` 一致

只有把这四跳串起来，才可以判断线上版本到底有没有包含当前代码。

## 何时调用

- 已经命中到真实实例或 pod，但线上行为看起来仍像旧逻辑
- 已经拿到 cluster / deployment / version 线索，需要进一步做到提交级核对
- 当前差异已经不像请求 shape、配置或数据状态问题，而更像“线上是不是还是旧代码”
- `goal-rpc-loop` 当前阻塞点明确是“版本里到底有没有这次改动”

## 何时不要调用

- 真实命中的实例还没确认，cluster / deployment / version 都不清楚
- 当前问题更像请求 shape、配置、数据前置条件或流量命中问题
- 用户要的是发版、回滚、重部署，而不是先做版本归因

此时更合适的动作通常是：

- 先走 `rpc-request-shape-check`
- 或由主流程直接派 `rpc-pod-triage`
- 或转去具体部署 / 发布链路处理

## 不要直接把现象归因到“代码没生效”

当当前阻塞点仍是“线上版本是否真的包含本地代码”时，先做本命令，不要只凭回包现象、零散日志或口头部署记录就认定“代码没生效”。只有在 `base_commit_hash` 和本地 `HEAD` 已明确不一致时，才能把现象归因到版本未更新；如果二者一致，就应把控制权交回主流程继续查请求、日志或配置。

## 输入

- 本次请求命中的 cluster / deployment / pod / instance 线索
- 该实例上报的 version 信息
- 能查询 SCM version / `base_commit_hash` 的页面、接口或命令入口
- 本地仓库路径与当前比较基线
- 当前预期行为与实际差异

## 固定检查链路

默认按下面顺序做，不要跳成“线上现象不对 -> 直接说部署没生效”：

1. 先确认真实命中的实例版本
2. 再查这个实例版本对应的 SCM version
3. 再查这个 SCM version 对应的 `base_commit_hash`
4. 在本地仓库取 `git rev-parse HEAD`
5. 只根据 `base_commit_hash == HEAD` 与否给出版本结论
6. 把控制权交回主流程决定下一跳

## 第 1 步：确认真实命中的实例版本

至少记录：

- cluster / deployment / pod / instance
- 本次真实命中实例上报的 version
- 为什么这是“真实命中版本”，而不是环境里另一个候选 deployment

如果连真实命中的实例都没确认，就不要提前进入 SHA 核对。

## 第 2 步：查询对应的 SCM version

至少记录：

- 与该实例 version 绑定的发布记录或详情页
- 里面展示的 SCM version
- 是否排除了相邻版本、旧 deployment 或其他噪音候选

## 第 3 步：查询对应的 `base_commit_hash`

至少记录：

- 该 SCM version 对应的 `base_commit_hash`
- 这个字段为什么是代码基线提交，而不是页面上的其他 SHA 或展示字段

## 第 4 步：读取本地 HEAD

执行并记录：

```bash
git rev-parse HEAD
```

必要时也补充：

- 当前本地分支
- 是否存在未提交改动
- 用户真正想比对的是本地 `HEAD`，还是某个已经 push 的特定提交

## 第 5 步：给出版本结论并交回主流程

结论只允许三类：

- `match`：`base_commit_hash == HEAD`
- `mismatch`：二者明确不相等
- `insufficient-evidence`：证据链缺口导致当前还不能下结论

不要把“猜测 deployment 可能没更新”写成既成事实。

## 建议落盘产物

至少保留：

- 命中实例信息：cluster / deployment / pod / version
- `SCM version`
- `base_commit_hash`
- 本地 `HEAD`
- 最终结论：`match` / `mismatch` / `insufficient-evidence`
- 下一步建议

推荐落到当前 session 的 round 分析或 shared 产物中，至少能被主流程重新读取和归并。

## 返回给主流程的最少信息

- 当前是否已经确认真实命中实例
- 版本到 SHA 的证据链是否完整
- 最终结论属于哪一类：`match` / `mismatch` / `insufficient-evidence`
- 下一步更推荐走哪条路：继续请求 / 日志 / 配置排查，还是进入部署 / 发布处理

注意：这里给的是建议，不是替 controller 做最终决策。

## 收口规则

只有同时满足下面条件，才算本命令完成：

- 已明确写出真实命中的实例版本
- 已明确写出对应的 `SCM version`
- 已明确写出对应的 `base_commit_hash`
- 已明确写出本地 `HEAD`
- 已给出最终结论：`match` / `mismatch` / `insufficient-evidence`
- 已留下可归并的证据路径与下一步建议
- 已把控制权交回主流程
