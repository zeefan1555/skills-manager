# Obsidian Bases

当 `obsidian-tools` 需要创建或编辑 `.base` 文件时，优先参考本文件。

## 目标

创建和编辑 Obsidian Bases 文件，支持：

- filters
- formulas
- properties
- summaries
- views

## 基本工作流

1. 创建 `.base` 文件
2. 定义全局 `filters`
3. 按需定义 `formulas`
4. 配置 `properties` 显示名
5. 添加 `views`
6. 校验 YAML 语法与字段引用
7. 在 Obsidian 中打开验证

## 基本结构

```yaml
filters:
  and: []

formulas:
  formula_name: 'expression'

properties:
  property_name:
    displayName: "Display Name"

summaries:
  custom_summary_name: 'values.mean().round(3)'

views:
  - type: table
    name: "View Name"
    order:
      - file.name
      - property_name
```

## 过滤器

```yaml
filters: 'status == "done"'

filters:
  and:
    - 'status == "done"'
    - 'priority > 3'
```

支持 `and` / `or` / `not` 嵌套。

## 常用属性

- note properties：`author`、`status`
- file properties：`file.name`、`file.path`、`file.folder`、`file.ctime`、`file.mtime`
- formula properties：`formula.my_formula`

## 公式示例

```yaml
formulas:
  total: "price * quantity"
  status_icon: 'if(done, "✅", "⏳")'
  created: 'file.ctime.format("YYYY-MM-DD")'
  days_old: '(now() - file.ctime).days'
```

## 视图类型

- `table`
- `cards`
- `list`
- `map`

## 约束

- `.base` 文件必须是合法 YAML
- 引用的 `formula.X` 必须先在 `formulas` 中定义
- 包含特殊字符的字符串要加引号
- 日期差值先取 `.days` 等数值字段，再做数值计算
