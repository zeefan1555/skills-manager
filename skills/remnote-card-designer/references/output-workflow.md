# 输出工作流 — 连接、写入、备份

本文件包含 RemNote 写入和 Obsidian 备份的完整 bash 脚本。SKILL.md 中引用本文件。

---

## 连接检查

```bash
# 前置检测：确认 remnote-cli 存在
command -v remnote-cli >/dev/null 2>&1 || { echo "remnote-cli not found"; exit 1; }

# 检查并启动 daemon
remnote-cli daemon status --text || remnote-cli daemon start

# 检查 Bridge 连接（最多等待 15 秒，每 3 秒检查一次）
for i in 1 2 3 4 5; do
  remnote-cli status --text && break
  [ $i -eq 5 ] && { echo "Bridge connection timeout after 15s"; exit 1; }
  sleep 3
done
```

若连接失败：停止写入，汇报失败原因，并输出兜底 `TEXT`（纯 RemNote 语法格式的 text 代码块，用户可直接粘贴到 RemNote）。

---

## 写入与备份

使用临时文件替代 heredoc，避免特殊字符问题。同时备份到 Obsidian Vault 的 `outputs/remnote/`。

```bash
# 备份目录
BACKUP_DIR="/Users/bytedance/Library/Mobile Documents/iCloud~md~obsidian/Documents/agent/outputs/remnote"
mkdir -p "$BACKUP_DIR"

# 生成文件名
TITLE="${TITLE:-文章标题或主题}"
TITLE_SLUG="$(printf '%s' "$TITLE" | tr ' ' '-' | tr -cd '[:alnum:]-_' | tr '[:upper:]' '[:lower:]')"
TMPFILE="$BACKUP_DIR/${TITLE_SLUG}-remnote-card-$(date +%Y%m%d-%H%M%S)-$$.md"

# 将标题与正文写入文件（标题便于在 Obsidian 中识别）
# 如有 Vault 来源，建议额外写入 Source Note / UID 元数据
printf '# %s\n\n%s\n' "$TITLE" "$TEXT" > "$TMPFILE"

# 写入 RemNote Journal
remnote-cli journal --no-timestamp --content-file "$TMPFILE"

# 备份保留：不删除 $TMPFILE（作为 Obsidian Vault outputs/remnote 内的备份）
```

---

## 路径白名单提示

如果运行环境启用了路径白名单且拦截写入 Obsidian 目录：
1. 先写入 `/tmp` 备份并提示用户手动移动
2. 在本地终端或 IDE 设置中将 Obsidian Vault 的 `outputs/remnote/` 加入允许路径（白名单）
3. 白名单生效后，再次执行上述写入流程即可直接落盘到 Obsidian

---

## Daemon 管理

- 不要主动停止 daemon
- 仅当用户明确要求关闭时，才执行：`remnote-cli daemon stop`
