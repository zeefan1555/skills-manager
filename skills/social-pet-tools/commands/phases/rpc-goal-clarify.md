# RPC Goal Clarify 命令

> **命令类型**：`phase`
>
> **所属主流程**：`goal-rpc-loop`
>
> **阶段定位**：`goal-rpc-loop` 的阶段 1：目标澄清与请求推导

## 定位

这是 **阶段 1：目标澄清与请求推导**。

它负责把用户的宏观预期，收敛成：

1. 场景
2. 接口链路
3. 请求候选
4. 关键断言
5. 待确认问题

## 输入

输入来自主目录：

- `goal-rpc-loop/00-raw-expectation.md`
- `goal-rpc-loop/01-plan.md`

## 输出目录

固定输出到：

```text
goal-rpc-loop/rpc-goal-clarify/
├── input.md
├── affected-rpcs.md
├── request-derivation.md
└── open-questions.md
```

## 各文件职责

- `input.md`
  - 原始预期的结构化整理
- `affected-rpcs.md`
  - 当前链路涉及哪些接口、顺序是什么
- `request-derivation.md`
  - 从代码、状态、环境推导请求字段
- `open-questions.md`
  - 仍然不确定、需要后续验证的问题

## 任务目标

让“我大概知道输入输出”变成“我知道第一轮应该打哪些接口、请求最少需要什么字段”。

## 执行步骤

1. 先整理用户原始预期
2. 识别场景与接口顺序
3. 从代码和状态推导请求字段
4. 写出第一轮请求候选
5. 列出当前还没确认的问题

## 完成条件

只有同时满足下面条件，才算 `rpc-goal-clarify` 完成：

1. 已写出接口链路
2. 已写出第一轮最小请求候选
3. 已把不确定点落到 `open-questions.md`
4. 下一步已经明确可以转到 `rpc-first-pass`
