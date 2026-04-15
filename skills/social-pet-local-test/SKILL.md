---
name: social-pet-local-test
description: 当在 social_pet 仓库中按本地 build.sh 和 ci/run.sh 跑单测，并需要基于日志校验 PASS/FAIL、检查本次改动代码覆盖率时使用。
license: MIT
compatibility: Requires the social_pet repository layout, build.sh, and ci/run.sh.
metadata:
  author: Trae
  version: "1.0"
---

# Social Pet 本地单测

仅在 `social_pet` 仓库中使用。适用于用户明确要求按仓库本地流程跑测试，而不是直接使用普通 `go test` 的场景。

## 能力范围

- 使用 `sh build.sh` 做本地构建准备
- 使用 `./ci/run.sh '<TestRegex>'` 执行单测
- 输出过长时重定向到日志文件
- 基于日志中的 `=== RUN`、`--- PASS:`、`--- FAIL:` 校验目标测试函数结果
- 仅校验“已写好的单测函数”是否可以通过（当前不做 coverage 覆盖校验）

## 何时使用

在以下场景使用：

- 当前仓库是 `social_pet`
- 用户明确要求按仓库本地方式跑单测
- 用户提到 `build.sh`、`ci/run.sh`、`coverage_service.html` 或本地覆盖率校验
- 当前任务不接受仅用标准 `go test` 作为验证方式

以下情况不要使用：

- 不具备该仓库结构的普通 Go 仓库
- 纯静态审查、不需要执行测试的任务
- 超出 `build.sh` 和 `ci/run.sh` 范畴的 E2E 或集成测试流程

## 核心流程

1. 先执行构建准备：

   ```bash
   sh build.sh
   ```

2. 再用仓库自带 runner 执行测试。优先使用一个正则一次性覆盖所有目标测试函数：

   ```bash
   ./ci/run.sh 'TestA|TestB|TestC'
   ```

3. 输出通常会很多，默认重定向到固定临时日志文件（避免刷屏，便于复查证据）：

   ```bash
   ./ci/run.sh 'TestA|TestB|TestC' > /Users/bytedance/worktree/test/social_pet/.tmp_ci_run.log 2>&1
   ```

4. 从终端输出或日志文件中检索以下关键字，确认测试实际执行结果：

   - `=== RUN   TestA`
   - `--- PASS: TestA`
   - `--- FAIL: TestA`
   - 最终 `PASS` / `FAIL`

5. 当前不做 coverage 校验（`coverage_service.html`）。只要“已写好的单测函数”在日志中被明确执行并 PASS，即认为本轮验证通过。

## 测试结果校验规则

不要因为命令 exit code 是 0 就直接宣称测试通过。

对每个目标测试函数，都必须校验以下事实：

- 日志中存在 `=== RUN   <TestName>`
- 日志中存在 `--- PASS: <TestName>` 或 `--- FAIL: <TestName>`
- 包级别最终结果不能作为唯一证据

好的结果表述方式：

- `TestComputeWidgetSubType`: saw `=== RUN` and `--- PASS`
- `TestGenerateDouShanWidgetSign`: saw `=== RUN` and `--- PASS`

不好的结果表述方式：

- "`ci/run.sh` exit code is 0 so everything passed"

## 推荐输出结构

建议按两部分输出：

1. 测试执行
   - 跑了哪个 regex
   - 哪些测试函数通过，哪些失败
   - 证据日志路径

2. 下一步
   - 如果 FAIL：根据报错补单测或修实现后重跑
   - 如果 PASS：进入下一任务或扩大测试范围（可选）

## 示例命令

单个测试函数：

```bash
./ci/run.sh 'TestComputeWidgetSubType'
```

多个测试函数一次执行：

```bash
./ci/run.sh 'TestComputeWidgetSubType|TestGenerateDouShanWidgetSign'
```

输出较多时建议：

```bash
./ci/run.sh 'TestComputeWidgetSubType|TestGenerateDouShanWidgetSign' > /Users/bytedance/worktree/test/social_pet/.tmp_ci_run.log 2>&1
```

## 常见错误

- 跳过 `sh build.sh`，直接跑 `ci/run.sh`
- 只看命令退出码，不看目标测试函数名
- 没把输出重定向到固定日志，导致无法快速回溯证据

## 收口规则

在 `social_pet` 仓库中，当前 skill 的“测试完成”定义为：

- 目标测试函数已经从日志中明确校验通过
