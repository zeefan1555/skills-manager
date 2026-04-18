# 02. Loop 1：第一轮执行

## Loop 1 的目标

先不急着判断最终对错，先把主链路完整跑一遍：

`GetPetElfCfg -> UpdateWidget -> GetWidget -> GetPetElfCfg`

## Step 1：先发第一轮请求

### 存量用户

按顺序发起：

1. `artifacts/stock/01-req-GetPetElfCfg-stock-first.json`
2. `artifacts/stock/02-req-UpdateWidget-stock.json`
3. `artifacts/stock/03-req-GetWidget-stock.json`
4. `artifacts/stock/04-req-GetPetElfCfg-stock-second.json`

### 新增用户

按顺序发起：

1. `artifacts/new/05-req-GetPetElfCfg-new-first.json`
2. `artifacts/new/06-req-UpdateWidget-new.json`
3. `artifacts/new/07-req-GetWidget-new.json`
4. `artifacts/new/08-req-GetPetElfCfg-new-second.json`

## Step 2：记录第一轮返回

### 存量用户

- 第一次 `GetPetElfCfg`
  - 返回：`NeedUpdateWidget=true`
  - 结论：符合预期
- `UpdateWidget`
  - 返回成功
  - 结论：符合预期
- `GetWidget`
  - 返回里只有 `401/402`
  - `403/404/405` 没出现
  - 结论：暂时不能下结论
- 第二次 `GetPetElfCfg`
  - 返回：`NeedUpdateWidget=false`
  - 结论：符合预期

### 新增用户

- 第一次 `GetPetElfCfg`
  - 返回：`NeedUpdateWidget=true`
  - 结论：符合预期
- `UpdateWidget`
  - 返回成功
  - 结论：符合预期
- `GetWidget`
  - 返回里只有 `401/402`
  - `403/404/405` 没出现
  - 结论：暂时不能下结论
- 第二次 `GetPetElfCfg`
  - 返回：`NeedUpdateWidget=false`
  - 结论：符合预期

## Step 3：Loop 1 的判断

第一轮结束时，不应该直接写“全部通过”。

更准确的判断是：

- `GetPetElfCfg`：通过
- `UpdateWidget`：通过
- 第二次 `GetPetElfCfg`：通过
- `GetWidget`：`UNKNOWN`

原因是：

- 最初从宏观预期出发时，容易以为新增了 `401~405`，那就应该都看到
- 但实际只看到了 `401/402`
- 这时还不能确定是 bug，还是当前配置 / subtype 语义本来如此

## Loop 1 的输出

第一轮输出不是最终结论，而是一个新的问题：

> 为什么 `GetWidget` 只出现 `401/402`，没有 `403/404/405`？

所以下一步必须进入 Loop 2。
