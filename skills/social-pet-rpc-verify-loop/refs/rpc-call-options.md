# RPC Call 选项参考（填空用）

本文件用于集中维护 `bytedcli api-test rpc-call` 的“环境/IDL/路由”选项，避免每次在主 skill 里重复描述。

> 约定：在执行阶段 B/C 前，先把本文件里的“本次验证配置”填好，然后在 md 报告和命令里统一引用。

## 本次验证配置（请填写）

- `NPM_CONFIG_REGISTRY`: `http://bnpm.byted.org`
- `PSM`: `ttgame.social.pet`
- `Control Plane`: `China-online`
- `Env`: `ppe_tab_template`
- `IDL Source`: `branch`
- `IDL Version/Branch`: `feat_widget_feed_chat_test`
- `IDC`: `lf`
- `Zone`: `CN`
- `Cluster`: `default`

## 执行前检查

- 先确认当前验证环境是否真的是 `ppe_tab_template`，不要把 `ppe` / `ppe_tab_template` 混用
- 先确认 `IDL Source` / `IDL Version` 是否对应当前代码分支
- 先确认 `PSM / Control Plane / IDC / Cluster` 是否与目标实例一致
- 需要白名单时，先 `get` 当前 TCC，不要上来就 `update`
- 默认所有请求/返回/日志文件都落到 `docs/rpc-verify/artifacts/`
- 默认串行执行 RPC，不要并发跑多个 `rpc-call`

## 测试账号清单（用于阶段 B/C 构造最小请求）

- 测试账号 12342164568
  - uid: 1099953590248462
  - did: 1391327338308871
- 测试账号 12342164567
  - uid: 4477653324664615
  - did: 649136499878756
- 测试账号 12342164569
  - uid: 4196178329875469
  - did: 1391327338308871
- 测试账号 12342164570
  - uid: 2085116002704120
  - did: 649136499878756

会话 ID 对照
- 69 & 67：7606088834656338478
- 69 & 68：7618357803756913171
- 68 & 70：7610720767763841588
- 69 & 70：7605487860061372938

使用建议

- `69 & 67`：本次已验证可用于 Widget 白名单 case
- `69` 主用户：`uid=4196178329875469`，`did=1391327338308871`
- 如果是会话相关 RPC，优先选“已知存在数据”的会话，不要随机换会话
- 如果是实验/白名单相关 case，优先固定一组账号和会话，避免把“账号变化”误判成“代码变化”

## TCC 相关命令参考

读取当前配置：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org \
npx -y @bytedance-dev/bytedcli@latest --json tcc config get \
ttgame.social.pet WidgetConfig --env ppe_tab_template --region CN --dir /default
```

实战经验：

- namespace 使用 `ttgame.social.pet`
- 配置名使用 `WidgetConfig`
- 常见目录是 `/default`
- 白名单验证时，优先看 `check_white_list`
- 多闪签名验证时，优先看 `dou_shan_sign`

## 日志回查命令参考

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org \
npx -y @bytedance-dev/bytedcli@latest log get-logid-log \
<log_id> --psm ttgame.social.pet --output console --scan-span 30 \
> docs/rpc-verify/artifacts/<method>_<case>_service.log
```

日志重点看什么：

- 是否进入目标 RPC
- 是否进入目标 helper
- 是否有明确 reason（例如 `never generated`）
- 是否仍在打印旧日志签名（用于判断环境代码未更新）

## 命令模板

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org \
npx -y @bytedance-dev/bytedcli@latest --json api-test rpc-call \
<PSM> <MethodName> \
--idl-source <idl-source> \
--idl-version <idl-version> \
--control-plane <control-plane> \
--idc <idc> \
--env <env> \
--zone <zone> \
--cluster <cluster> \
--body-file <request-json-file> \
--with-logid > <output-json-file>
```

## 示例（GetPetElfCfg）

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
--body-file <request.json> \
--with-logid > <out.json>
```

## 高价值经验

### GetPetElfCfg / NeedUpdateWidget

如果目标是验证 `NeedUpdateWidget`，优先准备“成长态请求”，而不是只传最小字段：

- `Version=2`（即 `SAR3D`）
- `IsGrowth=true`
- `HasWidget`
- `ImageID / StickerIDs / ActionIDs`
- `UserDevices`
- `Extra.conversation_short_id`
- `Extra.cur_image`
- `Extra.bag`

如果返回体中没有 `NeedUpdateWidget`：

- 先查是否真的进入 `GetPetElfGrowthCfg`
- 再查是否走到 `GetPetElfWidgetInfo -> IsNeedUpdateWidget`
- 最后再判断是否是字段被省略序列化

### GetWidget / FoodUrl

如果目标是验证 `FoodUrl`，先区分三种情况：

1. widget 还没生成
2. widget 已生成，但实验/白名单未命中
3. 目标环境代码未更新

推荐顺序：

1. 先跑 `GetWidget`
2. 如果日志出现 `never generated`，先跑 `UpdateWidget`
3. 再重试 `GetWidget`
4. 如果 `Widgets` 已正常返回但仍无 `FoodUrl`，立刻查日志里是否还是旧 helper（例如仍打印 `IsHitWidgetAbTest`）

如果确认目标实例仍是旧代码，不要继续补请求，直接在报告中标记为“环境阻塞”

### GetWidget / 云渲染服务部署与落库验证

如果当前链路依赖云渲染服务，除了 `GetWidget` 本身，还要额外验证“下游渲染服务是否真的部署到了当前环境”。

高价值信号：

- `UpdateWidget` 日志里有 `SendCreateWidgetEvents` 且 `SendBatch success`
- 但 Redis `WidgetProgress:<convID>:<version>` 为空
- Mongo `social_pet_widget` 没有该 `version` 的新文档
- `CompleteWidgetRender` 在时间窗内没有命中该会话

这组信号优先说明：

- 下游云渲染服务未部署到当前环境
- 或回调目标没有对到当前环境

一旦补齐部署后，常见的第一阶段变化是：

- `GetWidget` 从 `RenderState=4 (Timeout)` 变成 `RenderState=1 (Producing)`

这说明：

- 下游链路开始工作了
- 但还没有完成最终落库
- 此时应继续观察 Mongo 新版本资源和 Redis progress，而不是继续怀疑 `UpdateWidget` 入口

## 常见坑

- `--idl-source` / `--idl-version` 搞混：分支模式用 `--idl-source branch` 且 `--idl-version <分支名>`
- `--control-plane` / `--env` / `--idc` / `--cluster` 任意一个不一致，都可能导致“打到错误实例/错误配置”
- 忘记 `--with-logid`：后续无法稳定回查 Argos 日志
- 请求体被终端污染后继续使用
- 同一终端并发执行多个命令，导致前一个输出被覆盖
- `GetWidget` 没先排除 `never generated` 就直接断言 `FoodUrl`
- `GetPetElfCfg` 没补成长态字段，就直接拿字段缺失当失败结论
