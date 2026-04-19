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
- scope: `<rpc-request-shape-check | scm-sha-check | goal-rpc-loop | rpc-gap-loop | cds | local-test | 未拆分命令>`
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

## 2026-04

### L-20260419-01

- created_at: `2026-04-19 16:03:29 +08:00`
- source: `复测结论`
- topic: `doushan-request-shape`
- wrong_assumption: `拿到一份客户端请求样例后，就可以原样重放并据此判断服务端逻辑是否异常`
- verified_conclusion: `先按代码确认服务端真实消费字段，再对齐 Extra.widget / Extra.bag / cur_image 等会影响前置分支命中的客户端上报态；请求形态未对齐前，RPC 结果没有可比性，也不应直接归因到服务端逻辑`
- scope: `rpc-request-shape-check`
- evidence:
  - `social-pet-tools/references/evidence/2026-04-19-doushan-rpc-shape-and-scm-sha/index.md`
  - `docs/social-pet/2026-04-19-doushan-actualsign-rpc-acceptance/goal-rpc-loop/rpc-gap-loop/round-1/analysis.md`
  - `docs/social-pet/2026-04-19-doushan-actualsign-rpc-acceptance/goal-rpc-loop/rpc-gap-loop/round-1/requests/raw/20-getpetelfcfg-client-shape.actual.json`
  - `docs/social-pet/2026-04-19-doushan-actualsign-rpc-acceptance/goal-rpc-loop/rpc-gap-loop/round-1/responses/raw/20-getpetelfcfg-client-shape.resp.json`
- status: `copied`
- copied_to:
  - `commands/shared/rpc-request-shape-check.md`
- routed_at: `2026-04-19 16:28:29 +08:00`
- note: `已复制到 rpc-request-shape-check；后续遇到“先别怀疑服务端，先校验请求 shape”类问题时优先复用`

### L-20260419-02

- created_at: `2026-04-19 16:03:29 +08:00`
- source: `复测结论`
- topic: `doushan-scm-sha-check`
- wrong_assumption: `只要线上请求命中了目标实例，就可以默认该实例已经带上本地最新代码`
- verified_conclusion: `先核对命中实例的真实 cluster / deployment / version，再查该 version 的 base_commit_hash 并与本地 HEAD 对比；SCM SHA 未对齐前，不能把线上现象直接归因到当前代码`
- scope: `scm-sha-check`
- evidence:
  - `social-pet-tools/references/evidence/2026-04-19-doushan-rpc-shape-and-scm-sha/index.md`
  - `docs/social-pet/2026-04-19-doushan-actualsign-rpc-acceptance/goal-rpc-loop/rpc-gap-loop/round-1/analysis.md`
  - `docs/social-pet/2026-04-19-doushan-actualsign-rpc-acceptance/goal-rpc-loop/rpc-gap-loop/round-1/scm/version-list.json`
- status: `copied`
- copied_to:
  - `commands/shared/scm-sha-check.md`
- routed_at: `2026-04-19 16:28:29 +08:00`
- note: `已复制到 scm-sha-check；后续遇到“线上是不是还没带上这次代码”类问题时优先复用`
