# Social Pet Tools Lessons

本文件是 `social-pet-tools` 的长期经验总账。

这里默认只保留日志条目本身，不展开流程规则。具体写入和路由方式由 `commands/archive.md` 负责。

## 状态

- `active`：已进入总账，尚未复制到具体命令
- `copied`：已复制到一个或多个具体命令
- `rejected`：后续被证明不成立，或不值得继续复用

## 条目模板

```md
## YYYY-MM

### L-YYYYMMDD-NN

- created_at: `YYYY-MM-DD HH:MM:SS +08:00`
- source: `用户纠正 | AI 修正 | 复测结论`
- topic: `<topic>`
- wrong_assumption: `<原始错误假设>`
- verified_conclusion: `<最终验证后的正确结论>`
- scope: `<cds | local-test | goal-rpc-loop | rpc-gap-loop | 未拆分命令>`
- evidence:
  - `docs/social-pet/<date-topic>/...`
- status: `active`
- copied_to:
  - `<留空或 commands/xxx.md>`
- routed_at: `<留空或 YYYY-MM-DD HH:MM:SS +08:00>`
- note: `<补充说明>`
```

## 示例

```md
## 2026-04

### L-20260418-01

- created_at: `2026-04-18 22:10:00 +08:00`
- source: `用户纠正`
- topic: `widget-config`
- wrong_assumption: `默认把测试环境理解成 BOE`
- verified_conclusion: `当前任务使用的是 PPE，且相关配置修改和验证链路都基于 PPE`
- scope: `cds`
- evidence:
  - `docs/social-pet/2026-04-18-widget-config/review.md`
  - `docs/social-pet/2026-04-18-widget-config/cds/verdict.md`
- status: `copied`
- copied_to:
  - `commands/cds.md`
- routed_at: `2026-04-18 22:35:00 +08:00`
- note: `已复制到 cds 命令，lesson 保留原始记录`
```
