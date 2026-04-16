# Legacy Mapping

本文件说明 `social-pet-tools` 的新命令名与旧 `social-pet-*` skill 之间的映射关系。

目标是统一入口，不是替换或删除旧 skill。

## 一对一映射

| 新命令 | 旧 skill | 说明 |
|---|---|---|
| `local-test` | `social-pet-local-test` | 本地构建与 `ci/run.sh` 单测执行 |
| `config-modify` | `social-pet-config-modify` | `ppe_*` 下 `social_pet` CDS / SVN 配置修改 |
| `tcc` | `social-pet-config-modify` | `social_pet` 相关 TCC 配置修改与 bytedcli 发布 |
| `rpc-acceptance` | `social-pet-rpc-acceptance-loop` | 面向 RPC 黑盒验收与多 case 验证 |
| `rpc-pod-triage` | `social-pet-rpc-pod-triage` | 单次请求按 pod / 实例日志链路排障 |
| `rpc-verify` | `social-pet-rpc-verify-loop` | 改码后进入“单测 -> RPC -> 修复 -> 重试”的验证闭环 |
| `oncall` | `social-pet-oncall` | `social-pet` 相关 oncall 处置入口 |

## 使用建议

- 新任务优先从 `social-pet-tools` 进入，先做统一路由判断
- 需要查看旧流程细节、模板、refs 或历史约束时，直接跳转到对应旧 skill
- 如果聚合层的命令文档尚未落地，默认使用这里映射到的旧 skill

## 兼容说明

- 旧 skill 保持完全可用
- 旧 skill 的触发词、目录结构、内部模板和引用关系都不在本次改造范围内
- 聚合层仅新增一个更短、更稳定的命令命名体系，方便后续继续拆分 `commands/`

## 迁移原则

- 迁移是“新增聚合入口”，不是“搬空旧 skill”
- 新旧两套入口会并行存在一段时间
- 如出现信息冲突，优先以旧 skill 内已验证过的执行细节为准，再回补聚合层文档
