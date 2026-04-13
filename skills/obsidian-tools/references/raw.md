# Raw Command（简版参考）

## Trigger

- `raw`
- `row`
- `roll`
- `ingest`
- "收录这篇"
- "先存一下"

## 输入形式

- `raw https://example.com/article`
- `raw <一段文本>`
- `raw /local/path/file.md`

## URL 抓取路由

- 飞书文档：优先使用 feishu-docx 命令，详细查看 [feishu-docx](feishu-docx.md)
- 字节内网：使用 bytedcli-tools
- Twitter/X：使用 tweet 抓取逻辑
- 其他 URL：TBD（暂提示用户手动提供内容）

## 目标

把原始内容保存到 `raw/{area}/`，把图片/附件统一保存到 `raw/assets/`，补齐 frontmatter 并生成 summary，不做 wiki/concepts。

## 执行步骤

1. 识别输入类型
   - URL：按路由表选择抓取工具
   - 本地文件：读取文件
   - 文本：直接入库
2. LLM 判断领域归属，匹配已有 area 或创建新 area
3. 生成 summary（3-5 句，覆盖每个 tag 核心观点）
4. 生成 raw frontmatter
   - `source_url`
   - `author`
   - `ingested`
   - `type`
   - `area`
   - `tags`
   - `summary`
5. 将图片/附件统一写入 `raw/assets/`
6. 使用 Unix 命令写入 `raw/{area}/`
7. 记录到 `wiki/log.md`
8. 返回给用户
   - 保存路径
   - area
   - summary
   - 建议下一步执行 `compile`

## _inbox Triage

`raw --triage` 可处理 `_inbox/` 中 Web Clipper 落地的文件：
- 读取内容 → 补全 frontmatter → 生成 summary → 写入 `raw/{area}/` → 删除 _inbox 原文件

## 约束

- `raw` 阶段生成 summary 但不生成 `wiki/summaries` 或 `wiki/concepts`
- raw 文件写入后不可变
- 目标是低摩擦入库
- 日志只写 `wiki/log.md`
