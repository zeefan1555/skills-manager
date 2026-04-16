# Config Modify Command

> **引用规范**：`../references/conventions.md`、`../references/mapping.md`

## Trigger

- `config-modify`
- `config modify`
- `cds modify`
- “帮我改 ppe 的 social_pet 配置”
- “帮我改一个 CDS 字段并提交”
- “去配置目录改完后给我通知文案”

## 目标

把 `ppe_*` 下 `social_pet` 相关 CDS / SVN 配置修改任务统一路由到现有成熟流程，同时保持聚合层只做命令入口，不重写旧 skill 的执行细节。

## 输入

- `ppe` 目录名
- 配置文件名、关键词或业务名
- 字段路径
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

## 证据落盘

产物落盘到当前 session 的 `cds/` 子目录（详见 `../references/conventions.md` "证据落盘路径规范（AI 审计目录）"）：

```
docs/social-pet/<date-topic>/cds/
```

每次配置修改至少保留：

- `diff.patch` — `svn diff` 输出
- `verdict.md` — AI 判定（含文件路径、字段、旧值 → 新值、结论）

## 返回给用户

- 实际进入的 `ppe` 目录
- 修改的配置文件路径
- 修改字段与新值
- `svn diff` 校验结果
- `svn commit` 结果或 revision
- 一条 `@张菲帆` 提示文案
- 一条供复制到群里的机器人文案

## 约束

- 不在聚合层虚构第二套配置修改 SOP
- 不跳过 `svn update`、`svn diff`、`svn commit`
- 不对多个候选文件直接猜测
- 旧 skill 与聚合层描述冲突时，以旧 `social-pet-config-modify` 为准
