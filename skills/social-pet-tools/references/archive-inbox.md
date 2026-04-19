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
