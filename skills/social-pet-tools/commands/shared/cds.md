# CDS Command

> **命令类型**：`shared`
>
> **补充资料**：`../../references/env.md`
>
> **典型调用方**：`../workflows/goal-rpc-loop.md`、`../workflows/goal-code-loop.md`

## Trigger

- `cds`
- `modify`
- `cds modify`
- “帮我改 cds 配置”
- “帮我改一个 Excel 配置并提交”
- “帮我直接更新 PPE”
- “帮我改 WidgetCfg.xlsx 并推到测试环境”

## 目标

在固定目录 `/Users/bytedance/bytecode/im_pet/<ppe_xxx_xxx>` 中完成一轮可追溯的 CDS 修改闭环。

当前命令只聚焦两类需求：

1. 修改字段值
2. 新增列

默认目标不是“把表改了就算”，而是要闭环到：

1. 本地文件修改成功
2. `xlsx2json` 本地验证通过
3. `svn commit` 成功
4. `cmd_msg` 触发成功
5. 群里出现“更新成功,已同步到游戏测试环境”卡片

## 输入

优先收集以下输入：

- `ppe` 目录名
- 目标文件路径或文件名
- 修改类型：`改单元格/字段` 或 `新增列`
- 目标字段、行列位置、sheet 名
- 新值或新增列定义
- commit message

如果用户只给了模糊描述，优先补齐：

- 改哪个 `ppe`
- 改哪个文件
- 改哪个字段 / 新增哪一列
- 改成什么值

## 固定路径

```bash
/Users/bytedance/bytecode/im_pet/<ppe_xxx_xxx>
```

只允许在上述目录内执行本命令相关的搜索、修改和 `svn commit`。

## 核心结论

这条命令已经过时的部分：

- 不再默认使用 `openpyxl` 保存整本 `.xlsx`
- 不再把 `test_update` 当成首选触发入口
- 不再以“接口返回 ok”作为成功依据

当前已验证可用的 SOP：

- 小范围 Excel 改动优先使用 **XML 直改**
- 改完后必须本地跑一次 `xlsx2json`
- 触发更新优先使用 `cmd_msg`
- 成功与否以**群消息卡片**和 **CDS 版本号**为准

## 适用边界

### 适合本命令直接处理的

- 单个字段值修改
- 删除某个字段值
- 在已有结构里新增一个简单字段列
- 只涉及 `sheet1.xml` 的小范围可控变更

### 不适合直接按本命令硬改的

- 整列重排
- 批量插行 / 删行
- 复杂合并单元格调整
- 公式、条件格式、筛选区域、数据校验联动修改
- 需要同时改多个 XML part 的复杂结构变更

遇到这些情况，不要直接套用这里的低层 XML patch。

## 执行步骤

### 第 1 步：进入目录并刷新 SVN

```bash
cd /Users/bytedance/bytecode/im_pet/<ppe_xxx_xxx>
svn update
```

规则：

- `svn update` 失败就立即停止
- 不在旧副本上直接改

### 第 2 步：定位文件并确认当前值

优先顺序：

1. 用户给了路径：直接读取
2. 用户给了文件名：在目标目录中搜索
3. 命中多个候选：让用户确认，不要猜

对 `.xlsx` 至少确认：

- 目标 sheet
- 目标字段所在列
- 目标行
- 当前值

### 第 3 步：优先做副本实验

对于 `.xlsx`，先复制一份副本到审计目录，再在副本上试。

建议审计目录：

```bash
/Users/bytedance/bytecode/social_pet_gamecds/docs/social-pet/<date-topic>/
```

副本实验的目的是先回答两个问题：

1. 改法会不会把表结构弄坏
2. `xlsx2json` 之后目标 JSON 会不会真的变化

如果副本实验失败，不要碰真实文件。

### 第 4 步：修改方式选择

#### A. 修改字段值

默认使用 XML 直改指定 cell：

- 修改已有 cell 的值
- 删除一个 cell，让字段恢复为空
- 补回一个原本为空的 cell

关键原则：

- 尽量只改 `xl/worksheets/sheet1.xml`
- 不改 style、sharedStrings、公式链、关系文件
- 改动范围只覆盖目标 cell

#### B. 新增列

默认使用“最小结构改动”思路，不做整张表粗暴重排。

优先做法：

- 利用目标列附近已存在的空白列 / 预留样式位
- 把原字段头后移一列
- 在目标位置写入新列头和字段定义
- 给所有数据行补同一列的值

这次已验证通过的模式：

- 在“备注”前新增 `test` 列
- 新列定义：
  - 显示名：`test`
  - 服务端导出：`string`
  - 客户端导出：`string`
  - 字段名：`test`
  - json 类型：`string`
- 数据行统一填 `Test`

### 第 5 步：本地跑 xlsx2json 验证

这是强制步骤，不能跳过。

示例：

```bash
/Users/bytedance/bytecode/social_pet_gamecds/tools/cds_lark_robot/xlsx2json --mod=0 <xlsx-file>
```

成功判定：

1. 日志里出现 `begin export sheet:[WidgetCfg]`
2. 日志里出现 `export complete!`
3. 生成 `WidgetCfg.json`
4. 目标记录的 JSON 真正发生预期变化

如果导出失败，或者 JSON 没变化：

- 不提交
- 回到副本继续排查

### 第 6 步：将已验证改法应用到真实文件

只有当副本验证通过后，才把同样的 XML patch 应用到真实文件。

应用后再本地跑一轮 `xlsx2json` 做最终兜底验证。

### 第 7 步：提交 SVN

```bash
svn status <target-file>
svn diff <target-file>
svn commit <target-file> -m "<commit-message>"
```

校验重点：

- `svn status` 只包含预期文件
- 没有 `.bak`、`~$*.xlsx` 等临时文件被带进提交
- commit 成功并拿到 revision

### 第 8 步：通过 cmd_msg 触发更新

#### 正确入口

优先顺序：

1. `POST /webcast/social_pet_gamecds/cmd_msg`
2. 飞书群内真实 `@机器人`
3. `POST /webcast/social_pet_gamecds/test_update` 仅作调试兜底

`cmd_msg` 是当前已验证最稳定的后台触发方式。

#### bytedcli 调用方式

```bash
JWT=$(   NPM_CONFIG_REGISTRY=http://bnpm.byted.org   npx -y @bytedance-dev/bytedcli@latest --json auth get-bytecloud-jwt-token   | python3 -c 'import sys,json; print(json.load(sys.stdin)["data"]["jwt"])' )

BODY=$(cat <<JSON
{"token":"$JWT","chat_id":"oc_922afac84eeaccc771ee7a5b059e1edb","open_id":"","content":"更新ppe_tab_template"}
JSON
)

NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json   api-test http-call webcast.social.pet_gamecds   --http-path /webcast/social_pet_gamecds/cmd_msg   --http-method POST   --env prod   --idc lf   --zone CN   --cluster default   --header "Content-Type:application/json"   --body "$BODY"
```

参数约束：

- `env` 固定用 `prod`
- `chat_id` 使用目标群，如 `oc_922afac84eeaccc771ee7a5b059e1edb`
- `content` 使用真实命令，如 `更新ppe_tab_template`
- `open_id` 可以留空，已验证可用

### 第 9 步：查群消息做最终验收

不能只看 HTTP `200` 或 `{"status":"ok"}`。

必须回查群消息：

```bash
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --json   feishu im messages get   --chat-id oc_922afac84eeaccc771ee7a5b059e1edb   --page-size 3   --sort-rule ByCreateTimeDesc
```

成功判定：

1. 群里出现新卡片
2. 卡片标题是 `更新ppe_tab_template`
3. 卡片正文出现 `更新成功,已同步到游戏测试环境`
4. `WidgetCfg` 的 CDS 版本号提升
5. 卡片中的 SVN 记录包含本次 revision

## 已验证案例

以下模式都已经实测成功：

1. `405.subType` 从空改为 `1`
2. `405.subType` 从 `1` 改回空
3. 在“备注”前新增 `test` 列，并给所有行填 `Test`
4. 删除 `test` 列并恢复原结构

这些案例都成功闭环到了：

- 本地 `xlsx2json` 验证通过
- `svn commit`
- `cmd_msg`
- 群消息 `更新成功`
- CDS 版本号提升

## 失败排查

如果触发后群里返回 `没有可更新的内容`，按以下顺序排查：

1. 本地 `xlsx2json` 是否真的产生了新的 `WidgetCfg.json`
2. 目标记录的 JSON 内容是否真的变化
3. 是否误用了会破坏导出结构的编辑方式，例如 `openpyxl` 保存整本文件
4. `cmd_msg` 的 `logid` 对应实例日志里，是否出现：
   - `begin export sheet:[WidgetCfg]`
   - `export complete!`
   - `updateFile2TestCds`
   - `sendLarkMessage`

如果本地 `xlsx2json` 都不能稳定产出正确 JSON，不要继续往线上推。

## 审计产物

建议至少落这些证据文件：

- `readback.md`：读回校验
- `svn-status.txt`
- `diff.patch`
- `svn-commit.txt`
- `01-req-cmd_msg.json`
- `01-resp-cmd_msg.json`
- `02-resp-chat-messages.json`
- 如果做了副本实验：保留副本文件、patch 脚本和 `xlsx2json` 验证结果

## 不要这样做

- 不要再默认使用 `openpyxl` 保存整本 `WidgetCfg.xlsx`
- 不要先 `commit` 再验证 `xlsx2json`
- 不要只看 `cmd_msg` 的 HTTP 返回就宣称成功
- 不要把 `.bak` 或锁文件带进提交
- 不要对复杂结构改动直接硬改多个 XML part
- 不要在未验证副本的情况下直接碰真实文件
