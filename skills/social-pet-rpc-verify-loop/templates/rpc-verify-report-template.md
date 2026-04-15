# RPC 验证报告模板

**仓库：** `social_pet`  
**基线分支：** `online`  
**当前分支：** `<feature-branch>`  
**差异范围（分支 vs online）：** `<merge-base..HEAD>`  
**生成日期：** `<YYYY-MM-DD>`  

> Notes:
> - 本报告的“受影响 RPC 清单”来自相对 `online` 的累计差异。
> - 请求/返回/日志证据统一落盘到 `docs/rpc-verify/artifacts/`。

---

## A. 受影响 RPC 清单

### A1. 变更概览（vs online）

**变更文件：**
- `<file-1>`
- `<file-2>`

**关键行为变更：**
- `<behavior-1>`
- `<behavior-2>`

### A2. RPC 列表（所有受影响的同步 RPC）

| RPC | 为什么受影响 | 入口链路（高层） |
|---|---|---|
| `<MethodName>` | `<impact>` | `<call-chain>` |

---

## B. 请求体与预期断言

说明：
- 每个 RPC 默认 2 个用例：成功路径 + 最关键错误路径
- 若某个 case 依赖白名单，先在 C0 留档 TCC 配置
- 状态位要在每轮执行后回写

### <MethodName>

#### Case 1：成功路径（<一句话描述>）
- TCC 白名单：`需要/不需要`
- 请求已生成：`是/否`
- 预期已写：`是/否`
- 已执行：`是/否`
- 断言结果：`未执行/通过/不通过`
- 是否需要下一轮：`是/否`

最小请求体：

```json
{
  "Base": {
    "Caller": "rpc-verify"
  }
}
```

预期断言：
- `<assertion-1>`
- `<assertion-2>`

#### Case 2：关键错误路径（<一句话描述>）
- TCC 白名单：`需要/不需要`
- 请求已生成：`是/否`
- 预期已写：`是/否`
- 已执行：`是/否`
- 断言结果：`未执行/通过/不通过`
- 是否需要下一轮：`是/否`

最小请求体：

```json
{
  "Base": {
    "Caller": "rpc-verify"
  }
}
```

预期断言：
- `<assertion-1>`
- `<assertion-2>`

---

## C. 执行结果（含 log_id）

### C0. TCC 白名单确认

- 环境：`<psm / env / zone / dir>`
- 配置名：`<config-name>`
- 当前配置确认：

```json
{
  "check_white_list": [],
  "dou_shan_sign": ""
}
```

结论：
- `<tcc-conclusion-1>`
- `<tcc-conclusion-2>`

### C1. <MethodName>

#### Case 1：<一句话描述>
- 请求文件：`docs/rpc-verify/artifacts/<method>_<case>_req.json`
- 返回文件：`docs/rpc-verify/artifacts/<method>_<case>_out.json`
- `log_id`：`<log-id>`
- 实际结果：
  - `<actual-1>`
  - `<actual-2>`
- 对比结论：`通过/不通过`
- 初步判断：
  - `<reason-1>`
  - `<reason-2>`

#### Case 2：<一句话描述>
- 请求文件：`docs/rpc-verify/artifacts/<method>_<case>_req.json`
- 返回文件：`docs/rpc-verify/artifacts/<method>_<case>_out.json`
- `log_id`：`<log-id>`
- 实际结果：
  - `<actual-1>`
  - `<actual-2>`
- 对比结论：`通过/不通过`
- 初步判断：
  - `<reason-1>`
  - `<reason-2>`

### C2. 第二轮执行结果（如有）

适用场景：
- 第一轮已确认“不是代码必然失败”，而是请求条件/执行顺序不足
- 第二轮通常用于补齐请求体、调整执行顺序、先触发再查询

#### C2.1 <MethodName> 复测

修正点：
- `<fix-1>`
- `<fix-2>`

复测结果：
- 请求文件：`docs/rpc-verify/artifacts/<method>_<case>_round2_req.json`
- 返回文件：`docs/rpc-verify/artifacts/<method>_<case>_round2_out.json`
- 实际结果：
  - `<actual-1>`
  - `<actual-2>`
- 结论：`通过/不通过`

### C3. 环境阻塞判定（如有）

适用场景：
- 请求链路已确认走通
- 目标字段仍未返回
- 服务日志显示目标实例仍在运行旧逻辑或旧日志签名

阻塞证据：
- 服务日志：`docs/rpc-verify/artifacts/<method>_<case>_service.log`
- 关键日志：

```text
<old-helper-or-old-log-signature>
```

结论：
- 当前验证环境代码未更新到本地改动版本
- 不继续补请求体，等待部署后重跑对应 case

### C4. 本轮结论

- 已通过：
  - `<pass-case-1>`
  - `<pass-case-2>`
- 未通过：
  - `<fail-case-1>`
- 环境阻塞：
  - `<blocked-case-1>`

下一步：
- `<next-step-1>`
- `<next-step-2>`
