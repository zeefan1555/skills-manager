---
name: "ai-test-loop"
description: "Use when building a write-test-run-fix loop for Go code, especially when standard go test should be preferred but a repo needs local-only test bootstrap changes to unblock it."
---

# AI Test Loop

## Overview

这个 skill 记录一条可复用的 AI 单测闭环：

- 写代码
- 写单测
- 用标准 `go test` 运行目标测试
- 收集失败信息
- 把失败信息回给 AI 修复
- 再次运行直到通过

核心原则：

- 默认优先标准 `go test`
- 只有仓库本身把测试启动流程和运行环境强耦合时，才做本地临时解锁
- 本地临时解锁只服务本地验证，不要直接推线上

## 何时使用

在以下情况使用：

- 需要建立 `写代码 -> 写单测 -> 跑测试 -> 看报错 -> 修复 -> 重跑` 的闭环
- 用户希望优先使用标准 `go test`
- 目标仓库存在 `TestMain`、环境变量、配置中心、外部服务初始化等阻碍标准单测的问题
- 需要把“本地临时改动如何解锁 go test”记录下来，供下次快速复用

不要用于：

- 与代码和测试无关的普通问答
- 明显已经是纯净标准测试环境、无需额外说明的简单仓库

## 30 秒决策树

按下面顺序快速判断：

1. 这是普通 Go 单测仓库吗？
   - 是：直接用标准 `go test`
   - 否：继续看下一步
2. `go test ./<package> -run ...` 是在测试函数执行前就挂掉吗？
   - 否：直接按报错修代码或改单测
   - 是：继续看下一步
3. 报错像 `TestMain`、包级初始化、CDS、TCC、Consul、Mongo、Redis、配置中心这类启动问题吗？
   - 是：先做本地最小解锁
   - 否：先按普通测试失败处理
4. 本地最小解锁后，目标测试能否用标准 `go test` 跑通？
   - 能：继续走标准 `go test` 闭环
   - 不能：继续看下一步
5. 这个测试是否本来就依赖仓库私有环境、`ut_with_depend`、覆盖率脚本或内部 token？
   - 是：回退到内部脚本
   - 否：继续缩小问题范围，检查是否还有额外重初始化未隔离

一句话版：

- 能直接 `go test` 就不要上脚本
- `TestMain` 先挂就先本地解锁
- 解锁后还不行，再回退内部脚本

## 主流程

默认按下面的顺序执行：

1. 定位目标源码文件
2. 定位对应 `_test.go` 文件
3. 提取相关 `TestXxx` 测试函数名
4. 优先用标准 `go test` 跑目标测试
5. 如果失败，提取最小必要报错
6. 把失败信息回给 AI
7. AI 修复代码或单测
8. 重跑同一条测试命令
9. 直到通过

## 通用 Go 测试原则

### 1. 按包跑，不按文件跑

Go 测试的基本单位是包，不是测试文件。

如果用户说“跑这个单测文件”，实际应该：

- 读取这个 `_test.go`
- 提取里面的 `TestXxx`
- 用 `-run` 正则只跑这些测试名

### 2. 先跑最小范围

优先跑最小必要范围，而不是一上来全量跑整个仓库。

示例：

- 只跑一个测试函数：

```bash
go test ./service -run '^TestWidgetSrv_IsNeedUpdateWidget$' -p 1 -gcflags='all=-N -l'
```

- 跑一个测试文件里的多个测试函数：

```bash
go test ./service -run '^TestWidgetSrv_(IsNeedUpdateWidget|GetCurrentWidgetIDSetKey)$' -p 1 -gcflags='all=-N -l'
```

### 3. 失败时只提取关键信息

失败后返回这些信息给 AI 即可：

- 执行命令
- 退出码
- 编译错误
- 断言失败
- panic 栈
- 最相关的 20 到 80 行上下文

不要把整屏噪音日志都原样回传。

## 标准命令模板

### 单个测试函数

```bash
go test ./<package> -run '^TestName$' -p 1 -gcflags='all=-N -l'
```

### 一个测试文件对应的多个测试函数

```bash
go test ./<package> -run '^TestFoo|TestBar$' -p 1 -gcflags='all=-N -l'
```

更稳妥的写法是把正则整体包住：

```bash
go test ./<package> -run '^(TestFoo|TestBar)$' -p 1 -gcflags='all=-N -l'
```

## 推荐输出格式

每次测试后，按下面格式整理结果：

```text
命令: go test ./service -run '^TestWidgetSrv_IsNeedUpdateWidget$' -p 1 -gcflags='all=-N -l'
状态: PASS | FAIL
关键报错:
- ...
下一步:
- 修业务代码
- 修单测
- 重跑
```

## 何时不要直接怪测试代码

如果出现下面这些情况，优先怀疑“测试启动环境有问题”，而不是测试函数本身有问题：

- `TestMain` 先挂
- 包级初始化先 panic
- 配置中心、Consul、TCC、CDS、Mongo、Redis 相关错误在测试函数执行前出现
- 明明 `-run` 命中了测试名，但进程在进入测试前已经失败

## social_pet 仓库特别说明

### 为什么这个仓库会卡住标准 `go test`

`social_pet/service` 的问题不在单个测试文件，而在包级 [TestMain]。

典型链路是：

1. 运行 `go test ./service -run ...`
2. Go 先启动 `service` 包测试二进制
3. 先执行 `TestMain(m)`
4. `TestMain` 里做了 CDS、TCC、DaaS、完整服务初始化
5. 外部依赖未满足时，测试函数还没开始就先挂掉

这意味着：

- 裸 `go test` 失败，不一定是业务函数错了
- 很可能只是 `TestMain` 做了过重的初始化

### 本地最小改动解锁方案

适用场景：

- 你只想在本地快速验证某个 `service` 逻辑测试
- 你不准备把这类测试启动改动推线上
- 你希望优先用标准 `go test`

目标：

- 默认本地只做轻量测试初始化
- 把重依赖初始化改成“显式开启才执行”

#### 本地最小改动步骤

1. 在 `service/init_test.go` 增加初始化模式判断函数
2. 默认走轻量模式
3. 只有检测到内部脚本环境，或显式设置开关变量时，才走原有重初始化
4. 把 `Close(ctx)` 之类的收尾逻辑与初始化模式保持一致
5. 用标准 `go test` 验证目标测试

#### 固定操作清单

下次遇到类似 `TestMain` 过重、导致标准 `go test` 启动前就挂掉的仓库，可以优先照这个清单执行：

1. 定位测试入口文件，通常是 `<package>/init_test.go`
2. 判断失败是否发生在测试函数执行前
3. 如果是 `TestMain` 或包级初始化先挂，先不要改业务逻辑
4. 在 `TestMain` 里引入一个本地初始化开关，例如 `XXX_TEST_FULL_INIT=1`
5. 把初始化拆成两层：
   - 轻量初始化：mock、时间、基础上下文、必要的小型全局对象
   - 重量初始化：配置中心、外部服务客户端、完整 `Init(ctx)`、完整 `Close(ctx)`
6. 默认只执行轻量初始化
7. 只有显式开关或检测到内部脚本环境变量时，才执行重量初始化
8. 把收尾逻辑和初始化模式对齐，避免“没初始化却先 Close”导致二次 panic
9. 先新增一个很小的初始化模式测试，再跑目标测试
10. 用标准 `go test ./<package> -run ...` 验证
11. 如果仍被环境卡住，再考虑回退到内部脚本
12. 明确标注这类改动只限本地验证，不默认推线上

#### social_pet 模板

在 `social_pet/service/init_test.go` 这类场景里，可直接按下面的模板改：

1. 增加常量，例如 `SOCIAL_PET_TEST_FULL_INIT`
2. 增加判断函数，例如 `shouldRunFullTestInit()`
3. 在 `TestMain` 开头缓存判断结果，例如 `fullTestInit := shouldRunFullTestInit()`
4. 保留轻量初始化：
   - `testx.MockDB(ctx)`
   - `dal.InitMetrics(ctx)`
   - `dal.InitTime(ctx)`
   - `dal.MockTcc(ctx)`
   - `mock()`
   - `cgopool.InitGoRoutinePool(100)`
   - `InitPetElfActTaskCfg()`
5. 把重初始化包进 `if fullTestInit { ... }`：
   - `dal.InitConsecutiveChatTcc()`
   - `dal.InitDaaS()`
   - `Mock(cds.CheckExcelConf).Return().Build()`
   - `cds.UpdatePath(ctx, cds.GetSubID())`
   - `Init(ctx)`
6. 把 `Close(ctx)` 也放进 `if fullTestInit { ... }`
7. 用两个命令验证：

```bash
go test ./service -run '^TestShouldRunFullTestInit_' -p 1 -gcflags='all=-N -l'
go test -v ./service -run '^TestWidgetSrv_(IsNeedUpdateWidget|GetCurrentWidgetIDSetKey)$' -p 1 -gcflags='all=-N -l'
```

#### 本地最小改动原则

- 只改测试启动逻辑，不改业务逻辑
- 只为本地验证解锁，不作为正式线上改动直接提交
- 优先让目标测试能跑，不追求一步到位把全部历史初始化问题清干净

#### 推荐的本地开关写法

可以采用这类思路：

- 新增环境变量，例如 `SOCIAL_PET_TEST_FULL_INIT=1`
- 默认不设置时，跳过 CDS、DaaS、完整 `Init(ctx)` 之类的重初始化
- 只有内部脚本环境或显式设置该变量时，才保留旧行为

#### social_pet 本地验证命令

例如：

```bash
cd /Users/bytedance/worktree/widget/social_pet
sh build.sh
go test -v ./service -run '^TestWidgetSrv_IsNeedUpdateWidget$' -p 1 -gcflags='all=-N -l'
```

跑 `widget_srv_test.go` 当前两个测试：

```bash
cd /Users/bytedance/worktree/widget/social_pet
sh build.sh
go test -v ./service -run '^TestWidgetSrv_(IsNeedUpdateWidget|GetCurrentWidgetIDSetKey)$' -p 1 -gcflags='all=-N -l'
```

如果想保留原来的重初始化路径：

```bash
cd /Users/bytedance/worktree/widget/social_pet
sh build.sh
SOCIAL_PET_TEST_FULL_INIT=1 go test -v ./service -run '^TestWidgetSrv_IsNeedUpdateWidget$' -p 1 -gcflags='all=-N -l'
```

### 何时回退到内部脚本

如果出现以下情况，可以回退到内部脚本：

- 本地最小改动仍不足以解锁目标测试
- 测试本身确实依赖 `ut_with_depend`
- 你需要沿用仓库当前的覆盖率导出方式

命令示例：

```bash
cd /Users/bytedance/worktree/widget/social_pet
sh build.sh
./ci/run.sh TestWidgetSrv_IsNeedUpdateWidget
```

## 常见错误

- 把 `_test.go` 文件路径直接当成执行参数
  - Go 不按文件路径执行测试，而是按包执行。

- 一看到 `go test` 失败，就直接修改业务逻辑
  - 先确认是不是 `TestMain` 或包级初始化挂了。

- 为了本地验证去大改业务初始化代码
  - 优先做本地最小改动，只解锁测试启动路径。

- 把本地 workaround 当成正式线上改动
  - 这类改动是为了本地验证，不应默认推线上。

- 只看 `PASS`，不看是否真的命中了目标测试
  - 需要确认 `-run` 是否匹配到了正确的测试函数。

## 红旗信号

出现下面这些想法时，应立即停下来调整流程：

- “先随便跑一下全量再说”
- “直接按测试文件路径跑”
- “`-run` 了就一定不会触发 `TestMain`”
- “为了本地跑单测，可以顺手把业务初始化大改一遍”
- “本地解锁改动也可以直接提交上线”

## 最终交付要求

使用本 skill 时，最终结果至少应包含：

- 本次执行的准确命令
- 本次执行是 `PASS` 还是 `FAIL`
- 失败时的最小必要报错
- 如果做了本地临时改动，要明确写出：
  - 改了什么
  - 为什么只限本地
  - 是否需要还原
