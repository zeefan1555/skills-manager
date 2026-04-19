# Local Test Command

> **命令类型**：`shared`

## Trigger

- `local-test`
- `local test`
- “跑一下 social_pet 本地单测”
- “按 build.sh 和 ci/run.sh 跑测试”
- “帮我看这个测试到底 pass 还是 fail”

## 目标

把 `social_pet` 仓库里的“本地测试”任务稳定路由到仓库原生测试流程，而不是退化成普通 `go test`。

## 固定执行方式

1. 进入 `social_pet` 仓库根目录。
2. 先执行 `sh build.sh`。
3. 再执行 `./ci/run.sh '<TestRegex>'`。
4. 输出重定向到按时间戳创建的日志目录。
5. 用 `=== RUN`、`--- PASS:`、`--- FAIL:`、`PASS`、`FAIL` 判断真实结果。

推荐日志目录：

```bash
REPO_ROOT=$(pwd)
RUN_TS=$(date +%Y%m%dT%H%M%S)
LOG_DIR="${REPO_ROOT}/docs/test/log/run-${RUN_TS}"
mkdir -p "${LOG_DIR}"
```

如果给的是单个测试名，先反查真实测试文件：

```bash
TEST_NAME='TestFoo'
TEST_FILE=$(grep -R --include='*_test.go' "func ${TEST_NAME}" "${REPO_ROOT}/service" -l | head -n 1 | xargs basename)

if [ -z "${TEST_FILE}" ]; then
  echo "ERROR: cannot resolve test file for ${TEST_NAME}" >&2
  exit 1
fi

./ci/run.sh "${TEST_NAME}" > "${LOG_DIR}/${TEST_FILE%.go}.log" 2>&1
```

## 证据落盘

产物统一落到：

```text
docs/test/log/run-<timestamp>/
```

每次执行至少保留：

- 对应测试文件名的 `.log`
- `grep -E '=== RUN|--- PASS:|--- FAIL:|^PASS$|^FAIL$'` 的判定结果

## 约束

- 不要把本命令实现成普通 `go test`
- 不要只凭 exit code 宣称测试通过
- 在 `goal-code-loop` 或 `test-driven-development` 场景中，本地验证仍沿用这里的执行方式
