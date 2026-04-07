# Output

## 何时读取

- 用户要生成或下载 audio、video、report、quiz、flashcards、slides、infographic、data table
- artifact 生成后要查状态、下载或删除

## 创建产物

```bash
nlm audio create <notebook> --format deep_dive --length long --confirm
nlm video create <notebook> --format explainer --style classic --confirm
nlm report create <notebook> --format "Briefing Doc" --confirm
nlm quiz create <notebook> --count 10 --difficulty 2 --confirm
nlm flashcards create <notebook> --difficulty hard --confirm
nlm mindmap create <notebook> --confirm
nlm slides create <notebook> --confirm
nlm infographic create <notebook> --orientation landscape --style professional --confirm
nlm data-table create <notebook> "Sales by region" --confirm
```

## 状态与下载

```bash
nlm studio status <notebook>

nlm download audio <notebook> --id <artifact-id> --output podcast.m4a
nlm download video <notebook> --id <artifact-id> --output video.mp4
nlm download report <notebook> --id <artifact-id> --output report.md
nlm download quiz <notebook> --id <artifact-id> --format html --output quiz.html
nlm download flashcards <notebook> --id <artifact-id> --format markdown --output cards.md
```

## 默认策略

- 创建类命令通常需要 `--confirm`
- 发起生成后，不要假设已完成；先用 `nlm studio status <notebook>` 轮询
- 下载前先确认 artifact id、类型和目标输出格式
- 注意创建名与下载名不总是一致：例如 `slides create` 对应 `download slide-deck`，`mindmap create` 对应 `download mind-map`

## 修改与删除

```bash
nlm slides revise <artifact-id> --slide '1 Fix title' --confirm
nlm studio delete <notebook> <artifact-id> --confirm
```

## 常见问题

- **下载失败**：先确认 artifact 已完成生成
- **不知道 artifact id**：先跑 `nlm studio status <notebook>`
- **生成很慢**：明确告诉用户这是异步过程，并汇报当前状态

## 注意

- 输出文件路径要清晰，避免覆盖已有文件
- 下载命令的 `<artifact-id>` 与 notebook id 都要回显给用户，方便重试
