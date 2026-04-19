# Archive Inbox

本文件用于保存 `social-pet-tools` 里尚未正式写入 `lesson.md` 的经验草稿。

## 状态

- `draft`
- `updated`
- `ready-for-lesson`
- `moved-to-lesson`
- `rejected`

## 条目模板

```md
## YYYY-MM

### D-YYYYMMDD-NN

- draft_id: `D-YYYYMMDD-NN`
- created_at: `YYYY-MM-DD HH:MM:SS +08:00`
- last_seen_at: `YYYY-MM-DD HH:MM:SS +08:00`
- source: `用户纠正 | AI 修正 | 复测结论`
- topic: `<topic>`
- scope: `<goal-rpc-loop | rpc-gap-loop | cds | local-test | ...>`
- wrong_assumption: `<原始错误假设>`
- current_conclusion: `<当前修正后的结论>`
- index: `social-pet-tools/references/evidence/<date-topic>/index.md`
- evidence:
  - `social-pet-tools/references/evidence/<date-topic>/index.md`
  - `social-pet-tools/references/evidence/<date-topic>/...`
- status: `draft`
- lesson_id: ``
- note: `<补充说明>`
```

## 2026-04

### D-20260419-01

- draft_id: `D-20260419-01`
- created_at: `2026-04-19 16:03:29 +08:00`
- last_seen_at: `2026-04-19 16:03:29 +08:00`
- source: `复测结论`
- topic: `doushan-request-shape`
- scope: `goal-rpc-loop`
- wrong_assumption: `拿到客户端请求样例后，可以直接按样例字段重放并判断服务端逻辑是否有问题`
- current_conclusion: `先按代码确认服务端真实消费字段，再对齐 Extra.widget / Extra.bag / cur_image 等会影响前置分支的客户端上报态；请求形态没对齐前，RPC 结果没有可比性`
- index: `social-pet-tools/references/evidence/2026-04-19-doushan-rpc-shape-and-scm-sha/index.md`
- evidence:
  - `social-pet-tools/references/evidence/2026-04-19-doushan-rpc-shape-and-scm-sha/index.md`
  - `docs/social-pet/2026-04-19-doushan-actualsign-rpc-acceptance/goal-rpc-loop/rpc-gap-loop/round-1/analysis.md`
  - `docs/social-pet/2026-04-19-doushan-actualsign-rpc-acceptance/goal-rpc-loop/rpc-gap-loop/round-1/requests/raw/20-getpetelfcfg-client-shape.actual.json`
  - `docs/social-pet/2026-04-19-doushan-actualsign-rpc-acceptance/goal-rpc-loop/rpc-gap-loop/round-1/responses/raw/20-getpetelfcfg-client-shape.resp.json`
- status: `moved-to-lesson`
- lesson_id: `L-20260419-01`
- note: `已写入 references/lesson.md，待后续 archive route 判断是否复制到具体命令`

### D-20260419-02

- draft_id: `D-20260419-02`
- created_at: `2026-04-19 16:03:29 +08:00`
- last_seen_at: `2026-04-19 16:03:29 +08:00`
- source: `复测结论`
- topic: `doushan-scm-sha-check`
- scope: `rpc-gap-loop`
- wrong_assumption: `线上命中目标实例后，就可以默认实例已经带上本地最新代码`
- current_conclusion: `先核对命中实例的真实 cluster / deployment / version，再查该 version 的 base_commit_hash 并与本地 HEAD 对比；只有 SCM SHA 对上，才能判断线上版本真的包含当前代码`
- index: `social-pet-tools/references/evidence/2026-04-19-doushan-rpc-shape-and-scm-sha/index.md`
- evidence:
  - `social-pet-tools/references/evidence/2026-04-19-doushan-rpc-shape-and-scm-sha/index.md`
  - `docs/social-pet/2026-04-19-doushan-actualsign-rpc-acceptance/goal-rpc-loop/rpc-gap-loop/round-1/analysis.md`
  - `docs/social-pet/2026-04-19-doushan-actualsign-rpc-acceptance/goal-rpc-loop/rpc-gap-loop/round-1/scm/version-list.json`
- status: `moved-to-lesson`
- lesson_id: `L-20260419-02`
- note: `已写入 references/lesson.md，待后续 archive route 判断是否复制到具体命令`
