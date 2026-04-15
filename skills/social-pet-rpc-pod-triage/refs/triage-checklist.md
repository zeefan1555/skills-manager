# RPC Pod 排障清单

## 固定参数

- `PSM`: `ttgame.social.pet`
- `Control Plane`: `China-online`
- `Env`: `ppe_tab_template`
- `IDL Source`: `branch`
- `IDL Version`: `feat_widget_feed_chat_test`
- `IDC`: `lf`
- `Zone`: `CN`
- `Cluster`: `default`

## 1. 发送 RPC

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org \
npx -y @bytedance-dev/bytedcli@latest --json api-test rpc-call \
ttgame.social.pet <MethodName> \
--idl-source branch \
--idl-version feat_widget_feed_chat_test \
--control-plane China-online \
--idc lf \
--env ppe_tab_template \
--zone CN \
--cluster default \
--body-file <request.json> \
--with-logid > <response.json>
```

## 2. 提取 `log_id` / `pod_name`

```bash
python3 -c "import json; o=json.load(open('<response.json>')); d=o['data']['data']['data']; print('log_id=', d['log_id']); print('pod=', d['debug_info']['tce_info']['pod_name']); print('request_address=', d['request_address'])"
```

## 3. 优先查 lane 实例日志

按环境直接查 `UpdateWidgetDebug`：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org \
npx -y @bytedance-dev/bytedcli@latest log get-lane-instance-log ttgame.social.pet \
--env ppe_tab_template \
--env-type ppe \
--region China-North \
--start '<RFC3339 start>' \
--end '<RFC3339 end>' \
--keyword 'UpdateWidgetDebug' \
--output file \
--output-file docs/rpc-verify/artifacts/updatewidgetdebug_lane.log \
--limit 200
```

按环境直接查 `WidgetEventDebug`：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org \
npx -y @bytedance-dev/bytedcli@latest log get-lane-instance-log ttgame.social.pet \
--env ppe_tab_template \
--env-type ppe \
--region China-North \
--start '<RFC3339 start>' \
--end '<RFC3339 end>' \
--keyword 'WidgetEventDebug' \
--output file \
--output-file docs/rpc-verify/artifacts/widgeteventdebug_lane.log \
--limit 200
```

## 4. 针对本次 UpdateWidget 的 grep 关键词

### 判定链

- `UpdateWidgetDebug][WhiteList`
- `UpdateWidgetDebug][ABOrWhiteList`
- `UpdateWidgetDebug][AB]`
- `UpdateWidgetDebug][SignCheck`
- `UpdateWidgetDebug][NeedUpdateResult`

### 发送链

- `WidgetEventDebug`
- `SendCreateWidgetEvents`
- `SendBatch success`
- `sendBatchResp`

### CDS / 回调链

- `CDS配置获取失败`
- `GetSarWidgetResCfgAll`
- `CompleteWidgetRender`
- `ProcessComplete`
- `delWidgetProgress`

### 常见解释

- `checkWhiteList=[]`
  - 实例当前没读到白名单配置
- `whiteListHit=false`
  - 白名单未命中
- `abResult=map[]`
  - AB 未命中
- `abOrWhiteListHit=false`
  - 签名分支不会触发更新
- `needUpdate=false updateResult=Consistent`
  - 不会发消息
- `WidgetEventDebug` 无命中
  - 一般不是发送失败，而是根本没进入发送逻辑
- 回包 `CDS配置获取失败`
  - 一般说明已经走到 `SendCreateWidgetOrder`，但当前环境缺 CDS 配置
- `SendBatch success`
  - 说明应用层消息已发出，下一步看回调 / Mongo / `GetWidget`

## 5. Mongo 联查

查当前会话所有 widget 资源：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org \
npx -y @bytedance-dev/bytedcli@latest --json bytedoc db query \
--db-name ttgame_storage_test \
--collection social_pet_widget \
--query 'find({conv_id:"7606088834656338478"}).sort({version:-1, widget_id:1}).limit(50)'
```

查新版本资源：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org \
npx -y @bytedance-dev/bytedcli@latest --json bytedoc db query \
--db-name ttgame_storage_test \
--collection social_pet_widget \
--query 'find({conv_id:"7606088834656338478", version:{$gte:2}}).sort({version:-1, widget_id:1}).limit(50)'
```

## 6. Redis 联查

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org \
npx -y @bytedance-dev/bytedcli@latest --json cache execute-command \
--psm toutiao.redis.scene_game_test \
--command HGETALL \
--args 'WidgetProgress:7606088834656338478:4'
```

注意：

- `WidgetProgress:<convID>:<version>` 是**临时进度 key**
- 如果实例日志已经出现：
  - `addWidgetProgress success`
  - `ProcessComplete success`
  - `delWidgetProgress ... success`
- 那么此时再查 Redis 返回 `{}` 是正常的，因为 key 已被删除
- 所以 Redis 更适合判断“当前是否还在分批回调中”，不适合做“最终是否成功”的唯一标准

最终成功判据优先看：

- Mongo 是否存在目标版本完整资源
- `GetWidget` 是否返回 `RenderState=2` 且 `AniUrl` 非空

## 7. 本次 UpdateWidget 特化判断

如果你看到：

- `checkWhiteList=[]`
- `whiteListHit=false`
- `abResult=map[]`
- `abOrWhiteListHit=false`
- `needUpdate=false updateResult=Consistent`
- `WidgetEventDebug` 无命中

则当前最准确的结论是：

- 不是消息发送失败
- 而是实例没有读到白名单，导致请求根本没进入发送链路

如果你看到：

- 回包 `CDS配置获取失败`
- 日志 `GetSarWidgetResCfgAll(xxx) return nil`

则当前最准确的结论是：

- 请求已经进入发送前的资源组装阶段
- 当前优先排查 CDS 配置是否缺失 / 未发布 / 实例未读到最新配置

如果你看到：

- `SendBatch success`
- `CompleteWidgetRender` 持续进入
- Mongo 有目标版本新资源
- `GetWidget` 返回 `RenderState=2` 且资源非空
- Redis 最后为空，同时日志里有 `delWidgetProgress ... success`

则当前最准确的结论是：

- 整条链路已经打通
- Redis 为空是完成后的正常清理结果，不是异常
