# social-pet-rpc-verify-loop-test

这个目录是“从零开始做 RPC 验证”的历史实验记录版本。

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
6. `artifacts/stock/`
7. `artifacts/new/`

## 这个目录为什么还是旧结构

这个目录保留了历史实验时的原始组织方式，因此你会看到：

- `artifacts/stock/`
- `artifacts/new/`
- `commands.txt`
- `*_summary.json`
- `04-final-summary.md`

这些名称在“历史案例复盘”里仍然有用，但新的任务不建议继续沿用这套命名。

## 和新版模板的映射关系

如果你要把这个案例迁移到新版证据模型，可以按下面方式理解：

- `artifacts/*/commands.txt`
  - 对应新版 `round-N/commands/raw/`
- `artifacts/*/*-req-*.json`
  - 对应新版 `round-N/requests/raw/`
- `artifacts/*/*-resp-*.json`
  - 对应新版 `round-N/responses/raw/`
- `artifacts/*/*_summary.json`
  - 更接近新版 `round-N/index.json` 或归一化证据
- `04-final-summary.md`
  - 更接近新版 `closeout.md` 与顶层 `index.md` 的收口内容

新任务的推荐结构，请优先参考：

- `../rpc-evidence-template.md`
- `../recent-command-reuse.md`

## 原始证据

- 存量用户请求/返回：`artifacts/stock/`
- 新增用户请求/返回：`artifacts/new/`
- 配置旁证：`artifacts/widgetcfg_401_405_extract.txt`

## 适用场景

下次你再给我新的“宏观预期”时，我就可以按这套思路继续：

1. 先写原始预期
2. 再写我是怎么找到请求的
3. 再记录每轮请求与判断
4. 先检查最近可复用 round 是否存在，能复用就最小修改复用
5. 最后输出 `closeout.md` 和顶层索引结论
