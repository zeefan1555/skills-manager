# Legacy Mapping

本文件说明 `social-pet-tools` 的新命令名与旧 `social-pet-*` skill 之间的映射关系。

目标是统一入口，不是替换或删除旧 skill。

## 一对一映射

| 新命令 | 旧 skill | 说明 |
|---|---|---|
| `local-test` | `social-pet-local-test` | 本地构建与 `ci/run.sh` 单测执行 |
| `config-modify` | `social-pet-config-modify` | `ppe_*` 下 `social_pet` CDS / SVN 配置修改；当前 `cds` 命令默认走 XML-first，只覆盖“修改字段”和“新增列”；若目标是直接触发机器人更新 PPE，优先走 `cmd_msg`，不是 `test_update` |
| `tcc` | `social-pet-config-modify` | `social_pet` 相关 TCC 配置修改与 bytedcli 发布 |
| `rpc-acceptance` | `social-pet-rpc-acceptance-loop` | 面向 RPC 黑盒验收与多 case 验证 |
| `goal-rpc-loop` | `rpc-goal-loop` | 面向“高层预期 -> 推导请求 -> RPC 调用 -> 循环验证”的目标驱动闭环 |
| `rpc-pod-triage` | `social-pet-rpc-pod-triage` | 单次请求按 pod / 实例日志链路排障 |
| `rpc-verify` | `social-pet-rpc-verify-loop` | 改码后进入“单测 -> RPC -> 修复 -> 重试”的验证闭环 |
| `rpc-verify-spec` | — | 仅生成验证文档、预期返回和断言，不执行真实 RPC；与 `rpc-verify` 互补 |
| `oncall` | `social-pet-oncall` | `social-pet` 相关 oncall 处置入口 |

## 使用建议

- 新任务优先从 `social-pet-tools` 进入，先做统一路由判断
- 需要查看旧流程细节、模板、refs 或历史约束时，直接跳转到对应旧 skill
- 如果聚合层的命令文档尚未落地，默认使用这里映射到的旧 skill
- 当用户要“先梳理接口请求/返回/断言文档，不实际打 RPC”时，优先使用 `rpc-verify-spec`
- 当用户要“本地单测 + 真实 RPC 调用 + 回包校验 + 重试闭环”时，继续使用 `rpc-verify`
- 当用户只给了较粗的 RPC 预期文档，需要先一步步推导请求、执行并循环验证时，优先使用 `goal-rpc-loop`

## 兼容说明

- 旧 skill 保持完全可用
- 旧 skill 的触发词、目录结构、内部模板和引用关系都不在本次改造范围内
- 聚合层仅新增一个更短、更稳定的命令命名体系，方便后续继续拆分 `commands/`

## 迁移原则

- 迁移是“新增聚合入口”，不是“搬空旧 skill”
- 新旧两套入口会并行存在一段时间
- 如出现信息冲突，优先以旧 skill 内已验证过的执行细节为准，再回补聚合层文档
