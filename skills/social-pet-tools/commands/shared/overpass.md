# Overpass Command

> **命令类型**：`shared`
>
> **典型调用方**：`../workflows/goal-code-loop.md`

## Trigger

- `overpass`
- “先去下游库加字段，再拉回来”
- “当前依赖版本里缺少字段 / 方法，阻塞本仓开发”
- “这个字段要先在下游改完并 push，再回 social_pet go get”

## 目标

当 `social_pet` 的开发被下游 Go 依赖阻塞时，自动完成：

1. 定位下游仓库
2. 在下游创建与当前分支同名的 worktree
3. 完成字段 / 方法 / 接口变更并 push
4. 等待依赖可见
5. 回到 `social_pet` 执行 `go get`
6. 校验 `go.mod` 与 `go/pkg/mod` 中的真实代码已经更新

## 适用边界

当前命令只覆盖：

- 主仓库是 `social_pet`
- 下游是 Go module 依赖
- 下游仓库根目录统一在 `/Users/bytedance/bytecode`
- 分支名默认与当前 `social_pet` 分支一致

## 输入

优先收集这些输入：

- `repo_name`：下游仓库目录名，例如 `pet_common`
- `module_path`：Go module 路径，例如 `code.byted.org/ttgame/pet_common`
- `change_goal`：这次下游要补的字段 / 方法 / 接口语义
- `verify_file`：拉回后希望在 `go/pkg/mod` 校验的文件路径

如果用户没有显式给出 `repo_name` 或 `module_path`，但上下文足够明确，可以直接推导；不明确时再追问。

## 固定执行顺序

### 第 1 步：读取当前 `social_pet` 分支名

默认使用当前主仓库分支名作为下游分支名。

验证：

- 分支名非空
- 当前工作区分支已确定

### 第 2 步：定位下游仓库

固定根目录：

```text
/Users/bytedance/bytecode/<repo_name>
```

验证：

- 目录存在
- 是 git 仓库

### 第 3 步：建立同名 worktree

在下游仓库建立与当前分支同名的 worktree，并切到该分支处理修改。

验证：

- worktree 已创建
- HEAD 分支正确

### 第 4 步：完成下游改动并 push

在该 worktree 下完成最小必要改动，提交并 push 到远端同名分支。

验证：

- 本地 diff 只包含本次需求
- push 成功

### 第 5 步：等待依赖可见

默认等待 2-3 分钟，再回到 `social_pet` 拉取依赖。

验证：

- 达到最小等待时间
- 如首次拉取失败，可按短轮询重试

### 第 6 步：回到 `social_pet` 执行 `go get`

标准命令形态：

```bash
go get <module_path>@<branch_name>
```

验证：

- `go.mod` 已升级到新的依赖版本
- 必要时 `go.sum` 同步变化

### 第 7 步：校验模块缓存中的真实代码

不只看版本号，还要看本地模块缓存中的真实文件内容：

```text
$GOPATH/pkg/mod/<module>@<version>/...
```

优先校验：

- `verify_file` 中是否能读到目标字段 / 方法 / 接口

## 收口规则

只有同时满足下面条件，`overpass` 才算完成：

- 已定位正确的下游仓库
- 已在下游同名 worktree 中完成改动并 push
- 已在 `social_pet` 执行 `go get <module_path>@<branch_name>`
- 已确认 `go.mod` 升级成功
- 已在 `go/pkg/mod` 的真实文件里读到目标改动

## 常见错误

- 只改下游本地代码，不 push 就回主仓库 `go get`
- 只看 `go.mod` 版本号，不校验 `go/pkg/mod` 的真实代码
- 在已经确认是依赖缺口时，继续在 `social_pet` 里写临时兼容代码
- 下游改动还没可见就立即拉依赖，不做等待或重试
