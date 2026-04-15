---
name: social-pet-rpc-verify-loop
description: Use when在 social_pet 仓库中，代码改动并完成本地单测后，需要按受影响 RPC 接口自行构造请求、用 bytedcli 发起调用、核对返回并进入修复-验证循环时使用。
license: MIT
compatibility: Requires the social_pet repository layout and bytedcli access to ByteDance internal RPC testing endpoints.
metadata:
  author: Trae
  version: "1.0"
---

# Social Pet RPC 验证闭环

仅在 `social_pet` 仓库中使用。适用于“代码写完后，不只停留在单测通过，而是要继续根据受影响接口自行构造 RPC 请求，查看真实返回，不对就继续修复”的场景。

## 语言与报告规范（必须）

- **所有产出默认用中文**：包含阶段结论、RPC 清单、请求体说明、断言、失败原因、下一步建议（方便人工 review）
- 本 skill 的阶段性结果需要**逐段追加**写入同一个 md 报告文件（不覆盖历史）
- 推荐报告路径：`docs/rpc-verify/YYYY-MM-DD-rpc-verify.md`

## 环境与命令选项（填空参考）

将本次验证使用的 `PSM / Env / IDL 分支 / IDC / Cluster` 等集中维护在：

- `refs/rpc-call-options.md`

执行阶段 B/C 时：

- 先填好 `refs/rpc-call-options.md` 的“本次验证配置”
- 然后在 md 报告里引用对应参数，并用同一套参数生成所有 `rpc-call` 命令，避免混用导致误判

## 执行原则（本次沉淀后的强约束）

- **先读后改 TCC**：如果用户说“白名单已经加好”，先读当前环境配置确认，不要重复 update
- **串行执行优先**：默认一个 case 一个命令串行跑，避免同一终端被覆盖、输出文件互相污染
- **所有证据落盘**：请求体、返回体、日志文件统一落到 `docs/rpc-verify/artifacts/`
- **先判定链路是否走通，再看字段值**：字段缺失时，先确认请求是否真的走到目标逻辑，而不是直接怀疑代码
- **环境阻塞要尽早止损**：如果日志显示目标实例仍是旧逻辑，不要继续补请求体；应直接记录“环境代码未更新”

## 能力范围

- 专注接口影响分析 + 构造请求 + bytedcli 调用 + 返回校验（本 skill 不负责执行单测命令细节）
- 单测阶段复用 `social-pet-local-test`（本 skill 只声明调用，不重写其流程）
- 从 `idl/*.thrift`、`handler.go`、`service/*.go` 推断受影响 RPC 接口
- 根据 IDL 和代码读取路径构造“最小必要请求体”，而不是依赖完整客户端抓包
- 使用 `bytedcli api-test rpc-call` 对指定 `PSM / control plane / env / idl branch(or version) / idc / cluster` 发起 RPC 调用
- 检查关键返回字段、记录 `log_id`，必要时继续用 Argos/日志回查原因
- 如果返回不符合预期，继续执行“修代码 -> 单测 -> RPC 验证”循环

## 何时使用

在以下场景使用：

- 当前仓库是 `social_pet`
- 用户希望代码改完后自动做接口级验证，而不是只跑单测
- 用户提到“自己构造请求”“用 bytedcli 发 RPC”“看返回对不对”“自己循环修复”
- 变更影响了 `handler.go`、`service/service.go`、`service/*_srv.go`、`service/*_ctrl.go` 或相关 IDL 的入参/出参逻辑

以下情况不要使用：

- 纯前端改动，不涉及 `social_pet` RPC 接口返回
- 用户只要求本地单测，不需要接口联调
- 目标不是 `social_pet` 仓库

## 总流程

1. 先确认改动影响了哪些 RPC 接口
2. 先跑本地单测
3. （如需要）用 bytedcli TCC 先把白名单准备好（用于特定分支/用例）
4. 再为每个受影响 RPC 构造最小请求体（每个 RPC 默认 2 个 case：成功 + 最关键错误）
4. 用 `bytedcli api-test rpc-call` 发起真实 RPC
5. 校验关键返回字段
6. 如不符合预期，回到代码和日志定位原因，再进入下一轮

## 分阶段运行（写入同一个 md）

为了方便人工 review，本 skill 建议分 3 个阶段运行，且每个阶段都把结果写入同一个 md 文件：

- **阶段 A：生成受影响 RPC 清单（包含旁路接口）**
  - 生成并写入：`## A. 受影响 RPC 清单`
- **阶段 B：为每个 RPC 生成请求与预期（默认 2 个 case）**
  - 生成并写入：`## B. 请求体与预期断言`
- **阶段 C：执行 RPC 并记录结果（含 log_id）**
  - 执行并写入：`## C. 执行结果（含 log_id）`

> 约束：只有当人工 review 通过后，才可以宣称“验证完成”。本 skill 不应以“自动 PASS”代替正确性判断。

## 第 1 步：定位受影响 RPC 接口

本 skill 默认基于 **当前分支相对线上 `online` 分支的累计差异** 来定位影响面（不是只看工作区是否 dirty，也不是只看最近一个 commit）。

### 1.1 以 `online` 为基线获取差异（默认）

核心原则：**social_pet 的线上分支是 `online`，不是 `master`。**

推荐做法（概念层面）：

- 找 `base = merge-base(HEAD, online)`
- 取累计差异：`base..HEAD`
- 再叠加工作区未提交改动（可选，但推荐）

这样即使你已经在分支上提交了多个 commit（还未合到线上），也会被纳入“本次待验证变化集”。

### 1.2 叠加未提交改动（可选但推荐）

很多时候你会在最后一次 commit 后又改了点东西没提交。为了避免漏验证：

- 把 `git diff`（未暂存）和 `git diff --cached`（已暂存）也算进变化集

### 1.3 从差异中提取“改动符号”，再回溯 RPC

对变化集做两步：

1. 提取改动符号（symbols）：
   - 导出函数/方法（`func (s *Service) Xxx`、`func Xxx`）
   - 结构体字段
   - 常量 / 配置 key
   - 关键 helper（例如 AB 判定、白名单判定、签名计算）
2. 回溯 RPC：
   - 从改动符号向上找调用者（callers）
   - 一直追到对外 RPC 入口（通常在 `service/service.go` 或 `handler.go`）
   - 将所有可达的对外 RPC 加入验证集（包含旁路接口）

### 1.4 “旁路接口都要验”的定义

如果改动发生在共享逻辑（被多个 RPC 共用的 `srv/ctrl/helper`）：

- 这些 RPC 都视为“受影响接口”
- 每个接口至少构造 1 个能触发该逻辑的最小请求进行验证

停止条件：

- 只覆盖当前仓库内的同步 RPC（不跨服务、不自动覆盖异步副作用链路）

## 第 1.5 步：TCC 白名单准备（在构造请求前做）

一个接口可能需要**多个不同请求**来覆盖不同预期（成功 / 关键错误）。其中部分用例需要：

- 强制命中实验/灰度分支（白名单）
- 避免在更早校验点短路（让请求走到目标逻辑）

此时在阶段 B 生成请求前先做 TCC 白名单准备，并把“变更前/变更后/回滚”写入 md 作为证据。

### 1.5.1 读取现有配置（留档，便于回滚）

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org \
npx -y @bytedance-dev/bytedcli@latest --json tcc config get \
<namespace> <config_name> --env ppe --region CN > /tmp/tcc_<config_name>_before.json
```

### 1.5.2 更新配置（通过文件更新，避免手工拼 JSON）

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org \
npx -y @bytedance-dev/bytedcli@latest --json tcc config update \
<namespace> <config_name> --env ppe --region CN --data-type json \
--file /tmp/tcc_<config_name>_after.json --note "rpc-verify: add whitelist for cases"
```

### 1.5.3 （可选）回滚配置

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org \
npx -y @bytedance-dev/bytedcli@latest --json tcc config update \
<namespace> <config_name> --env ppe --region CN --data-type json \
--file /tmp/tcc_<config_name>_before_value.json --note "rpc-verify: rollback whitelist"
```

注意：

- 默认只允许改 `ppe`，不建议在 `prod` 做这类验证性白名单操作
- 不确定参数时先跑：`... tcc config get --help`、`... tcc config update --help`
- 先确认 namespace / dir / env 是否正确。本仓库本次实战中：
  - namespace 使用 `ttgame.social.pet`
  - 配置名为 `WidgetConfig`
  - 常见目录为 `/default`
  - 实际验证环境可能是 `ppe_tab_template`，不要想当然写成 `ppe`

优先从以下位置倒推：


- `handler.go`
- `service/service.go`
- `service/*_srv.go`
- `service/*_ctrl.go`
- `idl/*.thrift`

建议顺序：

1. 找变更代码直接修改了哪个返回字段或判定逻辑
2. 搜这个逻辑最终由哪个 service 方法返回
3. 再从 `idl/game.thrift` 或对应 thrift 文件定位 RPC 名称

例如：

- 如果修改了 `GetPetElfGrowthCfg` 里 `resp.NeedUpdateWidget`
- 则外部 RPC 是 `GetPetElfCfg`

## 第 2 步：先跑本地单测

**REQUIRED SUB-SKILL:** 使用 `social-pet-local-test`

先按仓库本地流程完成单测验证，再进入 RPC 调用阶段。不要跳过这一步直接把问题推给 RPC 返回。

单测阶段最少要输出：

- 跑了哪些测试函数
- 哪些 PASS / FAIL
- 日志证据路径

## 第 3 步：构造最小必要请求体

核心原则：**不是构造“完整客户端请求”，而是构造“能走到目标逻辑的最小请求”。**

### 3.1 从 IDL 先拿到入参骨架

先看 `idl/*.thrift` 里的请求结构：

- required 字段必须有
- optional 字段里，只补会被目标逻辑读到的字段

### 3.2 再从代码里补“逻辑必需字段”

沿着服务实现往下看，补这些类型的字段：

- 直接参与判断的字段
- 影响上下文初始化的字段
- 放在 `Extra` 里再被解包出来的字段
- 影响实验 / 白名单 / 设备分流 / 会话分流的字段

常见判断来源：

- `req.GetHasWidget()`
- `req.ImageID`
- `req.StickerIDs`
- `req.UserDevices`
- `req.Extra["conversation_short_id"]`
- `req.Extra["cur_image"]`
- `req.Extra["bag"]`
- `req.Base`

### 3.3 social_pet 常见“最小请求”经验

如果目标逻辑涉及 Widget / 成长玩法，通常至少要考虑：

- `Aid`
- `UserID`
- `DeviceID`
- `HasWidget`
- `Version`
- `IsGrowth`
- `ImageID`
- `StickerIDs`
- `ActionIDs`
- `UserDevices`
- `Extra.conversation_short_id`
- `Extra.cur_image`
- `Extra.bag`

### 3.4 最小请求优先，缺什么再补什么

推荐策略：

1. 先用最小请求打一次
2. 如果服务报缺字段、或没走到目标逻辑
3. 再根据代码读取路径逐步补字段

不要一上来就复制整份冗长客户端请求。

### 3.5 本次验证沉淀出的高价值前置检查

#### GetPetElfCfg / NeedUpdateWidget

如果目标是验证 `NeedUpdateWidget`，不要只传 `HasWidget` 和会话 ID。优先确认请求是否真的会进入成长态链路：

- `Version` 是否为 `SAR3D`（本次实战中为 `2`）
- `IsGrowth` 是否为 `true`
- `HasWidget` 是否符合用例预期
- `ImageID / StickerIDs / ActionIDs` 是否能支撑当前成长态判断
- `UserDevices` 是否已提供（AB 判断常会依赖）
- `Extra.conversation_short_id / cur_image / bag` 是否已提供

如果返回体里 **没有 `NeedUpdateWidget` 字段**，优先怀疑：

1. 请求没有进入 `GetPetElfGrowthCfg`
2. 请求没有走到 `GetPetElfWidgetInfo -> IsNeedUpdateWidget`
3. 字段被“false 省略”序列化

在这三类问题没排清前，不要直接判断“代码没生效”。

#### GetWidget / FoodUrl

如果目标是验证 `FoodUrl`，先把问题拆成两个前置状态：

1. **widget 是否已经生成**
2. **目标实例是否已经部署了新逻辑**
3. **下游云渲染服务是否已经部署到当前验证环境**

建议顺序：

1. 先跑 `GetWidget`
2. 如果日志/结果显示 `never generated` 或 `widget.Version <= 0`
3. 先跑一次 `UpdateWidget`
4. 再重试 `GetWidget`

如果第二次 `GetWidget` 已经能返回正常 `Widgets`，但仍没有 `FoodUrl`，再继续查 AB/白名单/环境代码差异。

#### GetWidget / 渲染资源落库链路

如果目标是验证 widget 渲染资源本身是否生成，不要只盯 `GetWidget` 返回，要同时看：

1. `UpdateWidget` 是否成功把 `producing.version` 往前推进
2. `SendCreateWidgetEvents` 是否 `SendBatch success`
3. Redis `WidgetProgress:<convID>:<version>` 是否开始出现进度
4. Mongo `social_pet_widget` 是否出现对应 `version` 的资源文档
5. `GetWidget` 当前是 `RenderState=1 (Producing)`、`RenderState=2 (Completed)` 还是 `RenderState=4 (Timeout)`

实战判定规则：

- **发送成功 + 无回调 + 无 progress + 无 Mongo 新版本文档**：
  - 优先怀疑下游云渲染服务未部署到当前环境，或回调链路没有对到当前环境
- **发送成功 + `GetWidget` 从 Timeout 变成 Producing + 仍无 Mongo 新版本文档**：
  - 说明下游渲染服务已经接通，但还处于处理中；此时不能再把问题归因到 `UpdateWidget` 入口
- **发送成功 + Mongo 有新版本资源 + `GetWidget` 仍看不到资源**：
  - 再回头查 `CompleteWidgetRender` / 资源读取 / IDL 展示链路

## 第 4 步：用 bytedcli 发 RPC

标准命令模板：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org \
npx -y @bytedance-dev/bytedcli@latest --json api-test rpc-call \
<PSM> <MethodName> \
--idl-source branch \
--idl-version <branch-name> \
--control-plane <control-plane> \
--idc <idc> \
--env <env> \
--zone CN \
--cluster <cluster> \
--body-file <request-json-file> \
--with-logid > <output-json-file>
```

例如：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org \
npx -y @bytedance-dev/bytedcli@latest --json api-test rpc-call \
ttgame.social.pet GetPetElfCfg \
--idl-source branch \
--idl-version feat_widget_feed_chat_test \
--control-plane China-online \
--idc lf \
--env ppe_tab_template \
--zone CN \
--cluster default \
--body-file .tmp_get_pet_elf_cfg_min_req.json \
--with-logid > /tmp/rpc_get_pet_elf_cfg_min.json
```

执行建议：

- 默认串行执行，不要在同一终端并发多个 `rpc-call`
- 输出文件命名建议使用 `<method>_<case>_out.json`
- 第二轮复测请求建议单独命名为 `<method>_<case>_round2_req.json`
- 如果需要先触发后查询（例如 `UpdateWidget` -> `GetWidget`），务必按顺序执行，不要并发

## 第 4.5 步：日志回查（不要只看 resp_body_json）

当字段缺失、结果不符合预期，必须带着 `log_id` 回查服务日志。

推荐命令：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org \
npx -y @bytedance-dev/bytedcli@latest log get-logid-log \
<log_id> --psm ttgame.social.pet --output console --scan-span 30 \
> docs/rpc-verify/artifacts/<method>_<case>_service.log
```

优先关注：

- 是否进入目标方法/目标 helper
- 是否出现明确 reason（例如 `never generated`）
- 请求 trace / 响应 trace 是否包含目标字段
- 日志文件里的代码位置是否还是旧逻辑

## 第 5 步：解析返回并断言目标字段

不要只看 `status=success`。

必须检查：

- 关键业务字段是否符合预期
- 服务侧 `log_id`
- 是否有错误信息

建议直接解析输出 JSON：

```bash
python3 - <<'PY'
import json
obj = json.load(open('/tmp/rpc_get_pet_elf_cfg_min.json'))
print('status', obj.get('status'))
inner = obj.get('data', {}).get('data', {}).get('data', {})
print('log_id', inner.get('log_id'))
resp = obj.get('data', {}).get('resp_body_json', {})
print('NeedUpdateWidget', resp.get('NeedUpdateWidget'))
PY
```

关注的字段示例：

- `NeedUpdateWidget`
- `WidgetSubType`
- `FoodUrl`
- `BaseResp`
- 其他本次改动涉及的出参

## 第 6 步：返回不对时进入循环

如果返回不符合预期，按下面顺序排查：

1. **确认请求是否真的走到了目标分支**
   - 是否命中了正确的 RPC
   - 是否命中了正确的代码分支 / IDL 分支
   - 是否把关键字段传上去了

2. **检查是否在更早的分支被短路**
   - 例如 `hasWidget=false`
   - 或会话、实验、装扮一致性判断提前返回

3. **拿 `log_id` 去查 Argos / bytedcli log**
   - 看服务日志中的 reason
   - 不要只猜代码路径

4. **判定是“请求问题”还是“环境问题”**
   - 如果日志显示请求没进入目标链路：优先补请求体
   - 如果日志显示目标实例仍在打印旧 helper / 旧日志签名：判定为环境代码未更新
   - 一旦判定为环境代码未更新，就停止继续补请求，把它写进报告
   - 如果 `UpdateWidget` 已经 `SendBatch success`，但 Redis progress / Mongo 新版本资源 / `CompleteWidgetRender` 全部没有痕迹：优先怀疑下游云渲染服务未部署或回调未对到当前环境

5. **补字段或修代码**
   - 如果是请求体不足：补最小缺失字段
   - 如果是代码 bug：回到实现修复

6. **重新跑单测，再重新发 RPC**

这个 skill 的目标不是“发一次请求”，而是形成：

`修代码 -> 单测 -> 最小请求 -> RPC -> 校验 -> 继续修`

的闭环。

## 推荐输出结构

建议按 4 部分输出：

1. 单测结果
   - 跑了哪些测试
   - 哪些通过 / 失败

2. 受影响接口
   - 哪个 RPC
   - 为什么它受本次改动影响

3. RPC 验证
   - 请求体文件路径
   - bytedcli 命令
   - 关键返回字段
   - `log_id`

4. 下一步
   - 如果返回正确：说明接口级验证通过
   - 如果返回错误：说明下一轮修复方向

## 示例：GetPetElfCfg 最小请求

这是一个实际可复用的最小请求样式：

```json
{
  "Aid": 1129,
  "UserID": 4196178329875469,
  "DeviceID": 1391327338308871,
  "HasWidget": true,
  "Version": 2,
  "IsGrowth": true,
  "ImageID": 631787591426,
  "StickerIDs": [1014, 4012],
  "ActionIDs": [11009],
  "UserDevices": {
    "3052708931583199": {
      "app_id": 2329,
      "last_time": 0,
      "device_id": 578764512177338,
      "version_code": "340700",
      "device_platform": "iphone",
      "install_id": 7507527630653113915
    }
  },
  "Extra": {
    "conversation_short_id": "7606088834656338478",
    "cur_image": "{\"round\":12,\"total_spark\":220}",
    "bag": "{\"loaded_actions\":{\"1\":[11008,11007,11006,11005,11009,11011],\"3\":[11008,11007,11006,11005,11009,11011],\"2\":[11008,11007,11006,11005,11009,11011]},\"loaded_action_round\":11,\"image_special_round\":{\"2\":11,\"3\":11,\"1\":11}}"
  },
  "Base": {
    "LogID": "20260414001000000000000000000001",
    "Caller": "aweme.im.growth"
  }
}
```

## 常见错误

- 只跑单测，不做接口级验证
- 只看 RPC 是否成功，不校验关键返回字段
- 请求体一开始就照抄完整客户端包，导致排查困难
- 把 `idl-version` 和 `idl-source` 搞混
- 忘记带 `--with-logid`
- 返回不对时不查 `log_id`，只凭猜测改代码
- 请求体 JSON 被终端污染后继续拿去发 RPC
- 同一终端并发跑多个 `rpc-call`，导致前一个命令被后一个覆盖
- 把“字段缺失”直接等价成“代码没生效”，没先确认是否走到目标链路
- 明明日志已经显示目标实例还是旧逻辑，却还继续补请求体

## 收口规则

在 `social_pet` 仓库中，这个 skill 的“验证完成”定义为：

- 本地单测已经通过
- 至少一个受影响 RPC 已用 bytedcli 成功调用
- 关键返回字段与预期一致
- 如果曾出现不一致，已经完成至少一轮“定位 -> 修复 -> 重试”
- 如果最终被环境阻塞，报告中必须明确写出“阻塞点、证据日志、建议下一步”，不能含糊写成“暂未通过”
