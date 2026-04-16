# Local Test Command

> **引用规范**：`../references/conventions.md`、`../references/mapping.md`

## Trigger

- `local-test`
- `local test`
- “跑一下 social_pet 本地单测”
- “按 build.sh 和 ci/run.sh 跑测试”
- “帮我看这个测试到底 pass 还是 fail”

## 目标

把 `social_pet` 仓库里的“本地测试”任务稳定路由到仓库原生测试流程，而不是退化成普通 `go test`。

聚合层在这个命令里只负责：

- 识别这是 `social_pet` 本地单测场景
- 约束必须沿用仓库原生测试方式
- 明确结果判断要基于日志证据
- 把可执行细节回退到旧 `social-pet-local-test`

## 输入

- `social_pet` 仓库路径
- 目标测试函数名或 `TestRegex`
- 是否需要输出日志文件路径
- 是否只是验证已有单测，而不是新增测试

如果用户没有给测试名，优先补齐测试函数名或正则，不要直接扩大到全量测试。

## 执行边界

1. 先确认当前任务确实要求按 `social_pet` 仓库原生方式执行本地测试。
2. 读取 `../references/conventions.md` 中的本地测试约束。
3. 执行细节直接复用旧 `social-pet-local-test`：
   - 先 `sh build.sh`
   - 再 `./ci/run.sh '<TestRegex>'`
   - 输出过长时重定向到固定日志文件
   - 用 `=== RUN`、`--- PASS:`、`--- FAIL:` 校验目标测试函数
4. 如果用户显式要求 `test-driven-development`，本地测试阶段仍按旧 `social-pet-local-test` 的执行与校验方式处理。

## 证据落盘

产物落盘到当前 session 的 `local-test/` 子目录（详见 `../references/conventions.md` "证据落盘路径规范（AI 审计目录）"）：

```
docs/social-pet/<date-topic>/local-test/
```

每次执行至少保留：

- `test-output.log` — 完整测试日志
- `verdict.md` — AI 判定（含目标函数 PASS/FAIL 判定与证据行）

## 返回给用户

- 实际执行的测试正则
- 是否执行了 `build.sh`
- 每个目标测试函数的 `PASS` / `FAIL`
- 证据落盘路径
- 下一步建议：继续修复、补测，或进入后续 RPC 验证

## 约束

- 不要把本命令实现成普通 `go test`
- 不要只凭 exit code 宣称测试通过
- 不要在聚合层重复拷贝旧 skill 的长流程细节
- 旧 skill 与聚合层存在差异时，以旧 `social-pet-local-test` 为准
