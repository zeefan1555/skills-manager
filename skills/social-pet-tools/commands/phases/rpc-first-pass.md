# RPC First Pass 命令

> **命令类型**：`phase`
>
> **所属主流程**：`goal-rpc-loop`
>
> **阶段定位**：`goal-rpc-loop` 的阶段 2：第一轮真实执行

## 定位

这是 **阶段 2：第一轮真实执行**。

它负责：

1. 按 `rpc-goal-clarify` 产出的请求候选执行第一轮 RPC
2. 保存请求、返回、`log_id`
3. 给出第一轮初判

## 输入

来自：

- `goal-rpc-loop/rpc-goal-clarify/affected-rpcs.md`
- `goal-rpc-loop/rpc-goal-clarify/request-derivation.md`

## 输出目录

固定输出到：

```text
goal-rpc-loop/rpc-first-pass/
├── requests/
├── responses/
├── logs/
└── verdict.md
```

## 各目录职责

- `requests/`
  - 第一轮请求 JSON
- `responses/`
  - 第一轮返回 JSON
- `logs/`
  - `log_id`、必要日志、补充链路信息
- `verdict.md`
  - 第一轮判断：哪些通过、哪些未知、下一步往哪走

## 任务目标

第一轮的目标不是“把所有问题都查清楚”，而是：

1. 让真实请求打出去
2. 拿到第一批事实
3. 判断哪些点已通过、哪些点需要继续 gap loop

## 执行步骤

1. 按顺序执行第一轮请求
2. 每个请求都保存 req / resp / `log_id`
3. 优先看关键字段，不先纠缠所有细节
4. 在 `verdict.md` 中标记：
   - `PASS`
   - `UNKNOWN`
   - `EXPECTED_DIFF`
   - `FAIL`

## 完成条件

只有同时满足下面条件，才算 `rpc-first-pass` 完成：

1. 第一轮关键请求都已落盘
2. 每个请求都至少有 req / resp / `log_id`
3. `verdict.md` 已明确写出下一步：
   - 直接关闭
   - 或进入 `rpc-gap-loop`
