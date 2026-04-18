# Config Modify Command

> **引用规范**：`../references/conventions.md`、`../references/mapping.md`

## Trigger

- `config-modify`
- `config modify`
- `cds modify`
- “帮我改 ppe 的 social_pet 配置”
- “帮我改一个 CDS 字段并提交”
- “去配置目录改完后给我通知文案”
- “帮我改一个 Excel 配置并提交”

## 目标

把 `ppe_*` 下 `social_pet` 相关 CDS / SVN 配置修改任务统一路由到现有成熟流程，同时保持聚合层只做命令入口，不重写旧 skill 的执行细节。

当目标文件是 `.xlsx` 时，默认目标是：

1. 走最短正确路径完成 Excel 修改
2. 用读回校验确认改动已落盘且位置正确
3. 完成 `svn status` / `svn commit`
4. 返回 revision 和可复制通知文案

## 输入

- `ppe` 目录名
- 配置文件名、关键词或业务名
- 字段路径或目标行列
- 新值
- commit message

如果以上关键信息缺失，优先补最少必要信息，不要直接盲搜并修改。

## 执行边界

1. 先确认任务属于本机 `/Users/bytedance/bytecode/im_pet/<ppe_xxx_xxx>` 下的 `social_pet` 配置修改。
2. 读取 `../references/conventions.md`，沿用聚合层的最小改动、证据落盘与兼容规则。
3. 可执行细节回退到旧 `social-pet-config-modify`，优先参考其既有命令文档：
   - `social-pet-config-modify/commands/modify.md`
   - `social-pet-config-modify/commands/cds.md`
4. 在旧 skill 的细节约束下完成：
   - `svn update`
   - 定位唯一文件
   - 最小改动
   - `svn diff` / `svn status` 校验
   - `svn commit`
   - 返回可复制 Lark 文案
5. 如果目标是 Excel 配置，优先参考本文件的“Excel 配置快速路径”；旧 skill 没覆盖到的 Excel 特殊情况，以本文件补充规则为准。

## Excel 配置快速路径（openpyxl）

### 默认工具

- `.xlsx` 默认直接使用 `python + openpyxl`
- 目标是“最快完成正确修改并提交”，不引入额外工具分支

### 推荐执行顺序

1. 进入目标 `ppe_*` 目录并执行 `svn update`
2. 定位唯一的 `.xlsx` 文件
3. 备份原文件（用于本地兜底回滚，不参与提交），例如 `WidgetCfg.xlsx.bak`
4. 用 `openpyxl` 修改：
   - 列位置
   - 表头值 / 字段名
   - 目标数据值
   - 样式（至少 font / fill / border / alignment）
5. 保存后重新读取目标行 / 列（读回校验），确认：
   - 列顺序正确
   - 字段名正确
   - 目标值正确
   - 样式未丢
6. 执行 `svn status <target-file>`
7. 执行 `svn diff <target-file>`；如果是 binary diff，要在结论里明确补充“已读回校验”
8. 确认 `.bak`、`~$*.xlsx` 等临时文件不进入提交
9. 执行 `svn commit <target-file> -m "<commit-message>"`

### 读回校验要求

- `.xlsx` 不能只看 `svn commit` 成功与否，必须做读回校验
- 对列移动类修改，至少校验表头行和字段名行
- 对值修改类修改，至少校验目标数据行
- 如果样式有要求（例如“颜色与表头一致”），必须显式校验样式复制成功

### 禁止事项

- 不要只改值，不校验列位置和样式
- 不要把 `.bak`、锁文件或其他临时文件一起提交
- 不要在 binary diff 不可读时，仍然只用“已修改”作结论

## 证据落盘

产物落盘到当前 session 的 `cds/` 子目录（详见 `../references/conventions.md` “证据落盘路径规范（AI 审计目录）”）：

```
docs/social-pet/<date-topic>/cds/
```

每次配置修改至少保留：

- `diff.patch` — `svn diff` 输出
- `verdict.md` — AI 判定（含文件路径、字段、旧值 -> 新值、结论）

如果是 Excel 修改，`verdict.md` 还应补充：

- 目标文件
- 调整的列 / 行 / 字段顺序
- 读回校验结果
- 是否存在未提交的 `.bak` / `~$*.xlsx` 临时文件

## 返回给用户

- 实际进入的 `ppe` 目录
- 修改的配置文件路径
- 修改字段与新值
- 如果是 Excel：补充说明改动所在行 / 列 / 字段顺序是否已校验
- `svn diff` 校验结果
- `svn commit` 结果或 revision
- 一条 `@张菲帆` 提示文案
- 一条供复制到群里的机器人文案

## 约束

- 不在聚合层虚构第二套配置修改 SOP
- 不跳过 `svn update`、`svn diff`、`svn commit`
- 不对多个候选文件直接猜测
- 旧 skill 与聚合层描述冲突时，以旧 `social-pet-config-modify` 为准
- 对 Excel 修改场景，优先保留“最快正确路径”，不要引入多余工具分支
