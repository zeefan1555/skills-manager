# Goal RPC Loop Example

本参考文件沉淀“从宏观 RPC 预期开始，逐步推导请求并循环验证”的实战模式。

## 参考案例目录

- `references/goal-rpc-loop-test/`

这个目录是历史实验案例，保留了当时真实执行过程中的旧布局；新的任务应优先按：

- `references/rpc-evidence-template.md`
- `references/recent-command-reuse.md`

来组织证据与复用最近 round。

## 这个案例展示了什么

它不是最终验收文档，而是更接近实验过程记录：

1. 用户最开始只给宏观预期
2. 先拆接口链路
3. 再查代码找请求
4. 跑第一轮请求
5. 发现差异后进入第二轮循环
6. 最后才整理总结

## 推荐阅读顺序

1. `goal-rpc-loop-test/00-raw-expectation.md`
2. `goal-rpc-loop-test/01-find-request.md`
3. `goal-rpc-loop-test/02-loop-1-first-run.md`
4. `goal-rpc-loop-test/03-loop-2-debug-and-rerun.md`
5. `goal-rpc-loop-test/04-final-summary.md`
6. `goal-rpc-loop-test/artifacts/stock/` 与 `goal-rpc-loop-test/artifacts/new/`

## 如何把旧案例映射到新版结构

这个历史案例仍然有参考价值，但阅读时要主动把旧布局映射到新版证据模型：

- `artifacts/stock/commands.txt`、`artifacts/new/commands.txt`
  - 对应新版 `round-N/commands/raw/`
- `*-req-*.json`
  - 对应新版 `round-N/requests/raw/`
- `*-resp-*.json`
  - 对应新版 `round-N/responses/raw/`
- `stock_summary.json`、`new_summary.json`
  - 更接近新版 `round-N/index.json` 或 `responses/normalized/`
- `04-final-summary.md`
  - 更接近新版 `closeout.md` 或顶层 `index.md` 的最终结论部分

也就是说，这个案例适合学习“链路推进方式”，但不应继续作为新任务的目录模板直接照抄。

## 如何复用到下一次任务

下次用户再给一份较粗的 RPC 预期文档时，可以直接照这个思路推进：

1. 先记录用户原始预期
2. 再写出“步骤 -> 验证”的短计划
3. 从代码和状态推导请求
4. 先检查最近可复用 round 的 `index.json`、`verdict.md`、`commands/`、`requests/`
5. 能复用就最小修改复用，不能复用再新建本轮证据
6. 结果不对时继续下一轮，并把差异写进新的 round 索引
7. 必要时动态切去 `rpc-pod-triage` / `cds` / `tcc`
8. 最后再收敛成 `closeout.md` 和顶层 `index.md`

## 关键经验

- 不要直接把高层预期当成最终断言
- 不要一开始就构造全量请求
- 不要把所有差异都叫做 bug
- 先保存证据，再下结论
- 历史案例可以复用思路，但新任务应优先使用新版 `round/index.json/closeout` 结构
- 当问题明显跨到日志 / 配置 / TCC 时，要及时切换对应命令，而不是在一个命令里硬撑到底
