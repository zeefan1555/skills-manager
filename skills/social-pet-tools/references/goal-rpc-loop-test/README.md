# social-pet-rpc-verify-loop-test

这个目录是“从零开始做 RPC 验证”的实验记录版本。

它不是最终验收文档，也不是事后总结，而是尽量还原下面这个过程：

1. 用户只给一个宏观预期
2. 我先拆问题，找接口链路
3. 再去查代码，推导请求字段
4. 然后发第一轮请求
5. 如果返回不符合预期，就继续进入下一轮 loop
6. 最后才整理成结论

## 阅读顺序

1. `00-raw-expectation.md`
2. `01-find-request.md`
3. `02-loop-1-first-run.md`
4. `03-loop-2-debug-and-rerun.md`
5. `04-final-summary.md`

## 原始证据

- 存量用户请求/返回：`artifacts/stock/`
- 新增用户请求/返回：`artifacts/new/`

## 适用场景

下次你再给我新的“宏观预期”时，我就可以按这套结构继续：

1. 先写原始预期
2. 再写我是怎么找到请求的
3. 再记录每轮请求与判断
4. 最后输出结论
