# Obsidian CLI

当 `obsidian-tools` 需要用到 CLI，或用户直接问 Obsidian CLI 怎么用时，优先参考本文件。

## 基本前提

- 使用 `obsidian` CLI 与正在运行的 Obsidian 实例交互
- 默认作用于最近聚焦的 vault
- 完整命令始终以 `obsidian help` 为准

## 语法

参数使用 `=`：

```bash
obsidian create name="My Note" content="Hello world"
```

布尔 flag 不带值：

```bash
obsidian create name="My Note" silent overwrite
```

多行内容用 `\n`，制表符用 `\t`。

## 文件定位

- `file=<name>`：像 wikilink 一样解析文件名
- `path=<path>`：从 vault 根目录开始的精确路径

优先使用 `path=`，这样最稳定。

## Vault 定位

如需显式指定 vault：

```bash
obsidian vault="agent" search query="test"
```

## 当前 skill 最常用命令

### 搜索

```bash
obsidian search query="keyword" path="wiki" limit=10
obsidian search:context query="keyword" path="wiki" limit=10 format=json
```

### 读取

```bash
obsidian read path="wiki/concepts/example.md"
obsidian property:read name="search_hits" path="wiki/concepts/example.md"
```

### 写入

```bash
obsidian create path="raw/area/example.md" content="..."
obsidian append path="_kb_meta/search_log.md" content="..."
obsidian property:set name="status" value="compiled" type=text path="raw/area/example.md"
```

### 图谱辅助

```bash
obsidian backlinks path="wiki/concepts/example.md" counts
obsidian links path="wiki/concepts/example.md"
```

## Datetime 约束

`obsidian property:set type=datetime` 使用：

```text
YYYY-MM-DDTHH:mm:ss
```

不要带时区偏移。

## 其他常见模式

```bash
obsidian files folder="raw" ext=md
obsidian daily:read
obsidian tasks daily todo
obsidian tags sort=count counts
obsidian eval code="app.vault.getFiles().length"
```

## 开发相关命令

```bash
obsidian plugin:reload id=my-plugin
obsidian dev:errors
obsidian dev:screenshot path=screenshot.png
obsidian dev:dom selector=".workspace-leaf" text
obsidian dev:console level=error
obsidian dev:css selector=".workspace-leaf" prop=background-color
obsidian dev:mobile on
```

## 约束

- `obsidian-tools` 默认优先使用这里列出的 CLI 能力
- 批量扫描、重建索引、超长文本落盘时，才退回 `rg` / `find` / 直接文件操作
