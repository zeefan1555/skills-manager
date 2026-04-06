# Raw Command

## Trigger

- `raw`
- `row`
- `roll`
- `ingest`
- “收录这篇”
- “先存一下”

## 输入形式

- `raw https://example.com/article`
- `raw <一段文本>`
- `raw /local/path/file.md`

## 目标

把原始内容保存到 `raw/{area}/`，只补齐必要 frontmatter，不做 summary / concept。

## 执行步骤

1. 识别输入类型
   - URL：抓取正文, 飞书文档优先使用 feishu-docx 命令， 详细查看 [feishu-docx](feishu-docx.md)
   - 本地文件：读取文件
   - 文本：直接入库
2. 判断领域归属，确定 `raw/{area}/`
3. 生成 raw frontmatter
   - `uid`
   - `source_url`
   - `author`
   - `ingested`
   - `type`
   - `area`
   - `status: pending`
   - `tags`
4. 保存到 `raw/`
5. 返回给用户
   - 保存路径
   - area
   - `status: pending`
   - 建议下一步执行 `compile`

## 约束

- `raw` 阶段不生成 `wiki/summaries` 或 `wiki/concepts`
- 目标是低摩擦入库，不追求一次整理到位
- 如果用户只是“先存一下”，优先成功落盘
