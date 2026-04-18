# Goal RPC Loop Example

本参考文件沉淀“从宏观 RPC 预期开始，逐步推导请求并循环验证”的实战模式。

## 参考案例目录

- `references/goal-rpc-loop-test/`

这个目录原先位于仓库 `docs/social-pet-rpc-verify-loop-test/`，现在已迁入主 skill 的 `references/` 下，作为命令级参考资产。

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

## 如何复用到下一次任务

下次用户再给一份较粗的 RPC 预期文档时，可以直接照这个思路推进：

1. 先记录用户原始预期
2. 再写出“步骤 -> 验证”的短计划
3. 从代码和状态推导请求
4. 保存每轮 req / resp / log_id
5. 结果不对时继续下一轮
6. 必要时动态切去 `rpc-pod-triage` / `cds` / `tcc`
7. 最后再收敛成结论

## 关键经验

- 不要直接把高层预期当成最终断言
- 不要一开始就构造全量请求
- 不要把所有差异都叫做 bug
- 先保存证据，再下结论
- 当问题明显跨到日志 / 配置 / TCC 时，要及时切换对应命令，而不是在一个命令里硬撑到底
