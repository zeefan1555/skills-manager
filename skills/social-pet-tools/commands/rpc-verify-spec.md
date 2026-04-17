# RPC Verify Spec Command

> **引用规范**：`../references/conventions.md`、`../references/mapping.md`、`./rpc-verify.md`

## Trigger

- `rpc-verify-spec`
- “帮我把受影响接口的预期返回和断言梳理成文档”
- “不打 rpc-call，只生成每个接口的验证文档”
- “给你改动点和预期结果，输出每个接口的请求、返回、断言”

## 目标

在 `social_pet` 仓库上下文中，把“改动点 + 预期返回结果”整理成结构化的 RPC 验证文档：

1. 收敛受影响 RPC
2. 为每个 RPC 生成独立文档
3. 输出最小请求体、预期返回、断言和人工确认点
4. 落盘到 `docs/social-pet/<YYYY-MM-DD>-<topic>/rpc-verify-spec/`

## 非目标

- 不执行 `bytedcli api-test rpc-call`
- 不输出运行时 `PASS` / `FAIL`
- 不替代 `rpc-verify` 的真实验证闭环

## 输入

用户提供一份 JSON，至少包含：

```json
{
  "topic": "widget-visibility",
  "change_summary": [
    "说明本次改动点"
  ],
  "rpcs": [
    {
      "rpc": "GetWidget",
      "service": "ttgame.social.pet.WidgetService",
      "why_affected": [
        "说明为什么这个接口会受影响"
      ],
      "cases": [
        {
          "name": "happy-path",
          "request": {
            "widget_id": "123"
          },
          "expected_response": {
            "status_code": 0,
            "data": {
              "visible": true
            }
          },
          "asserts": [
            { "path": "$.status_code", "op": "==", "value": 0 },
            { "path": "$.data.visible", "op": "==", "value": true }
          ],
          "manual_checks": [
            "确认这个 widget_id 在目标环境存在"
          ]
        }
      ]
    }
  ]
}
```

关键约束：

- `topic` 必填
- `change_summary` 必填，可为 string 或 string array
- `rpcs` 必填且不能为空
- 每个 `rpc` 必须有 `cases`
- 每个 `case` 至少要有 `request`，并且 `expected_response` / `asserts` 二选一至少提供一个

## 执行步骤

1. 读取并检查输入 JSON
2. 对缺失关键字段的输入先 ask-back，不静默脑补
3. 按 `docs/social-pet/<YYYY-MM-DD>-<topic>/` 创建 session
4. 把原始输入写到 `rpc-verify-spec/input.json`
5. 为每个 RPC 生成一个 Markdown 文档
6. 更新 `manifest.json`，记录 `rpc-verify-spec` 的产物路径

## Ask-Back Rules

以下情况必须回问用户：

- `topic` 缺失
- `rpcs` 为空
- 某个 RPC 没有 `cases`
- 某个 case 同时缺 `expected_response` 和 `asserts`

以下情况可以继续，但要在文档里显式提醒：

- `service` 缺失
- `why_affected` 缺失
- `asserts[].op` 不是 `==`、`!=`、`contains`、`exists`、`not_exists`

## 输出

固定落盘结构：

```text
docs/social-pet/<YYYY-MM-DD>-<topic>/
├── manifest.json
└── rpc-verify-spec/
    ├── input.json
    ├── getwidget.md
    └── ...
```

每个接口文档至少包含：

- 接口名与 `service`
- 为什么受影响
- case 列表
- 最小请求体
- 预期返回
- 断言列表
- 人工确认点
- `AI suggestion`：可能受同类逻辑影响的旁路接口
- `Open questions`：仍待人工确认的字段

## 断言写法

推荐使用接近 JSONPath 的路径表达，例如：

- `$.status_code`
- `$.data.visible`
- `$.items[0].widget_id`

推荐操作符：

- `==`
- `!=`
- `contains`
- `exists`
- `not_exists`

如果操作符不在以上范围内，可以保留原文，但要在生成文档时标记为“待人工确认”。

## 与 `rpc-verify` 的分工

- `rpc-verify-spec`：只整理验证文档，不发真实 RPC
- `rpc-verify`：本地测试 + 真实 RPC 调用 + 回包校验 + 修复后重试

如果后续要把文档里的 case 转成真实验证，直接转到 `rpc-verify`。

## 推荐返回结构

- 输入 JSON 是否完整
- 生成了哪些 RPC 文档
- 输出目录路径
- 哪些字段仍需人工确认
- 如果后续要做真实验证，应转到 `rpc-verify`
