# 01. 如何找到请求

## 第一步：先把宏观预期拆成接口顺序

从原始预期里，先抽出最小接口链路：

1. `GetPetElfCfg`
2. `UpdateWidget`
3. `GetWidget`
4. 再次 `GetPetElfCfg`

这一步的目标不是求细节，只是先明确“要验证哪些接口、按什么顺序验证”。

## 第二步：再问每个接口要验证什么

### `GetPetElfCfg`

要验证：

- 第一次是不是 `NeedUpdateWidget=true`
- 第二次是不是 `NeedUpdateWidget=false`

### `UpdateWidget`

要验证：

- 调用是否成功
- 是否为后面的 `GetWidget` 准备好了资源

### `GetWidget`

要验证：

- 当前 `WidgetSubType`
- 当前应该出现哪些 widget

## 第三步：开始查代码，找请求字段

从这里开始，才进入“推导请求”的阶段。

查代码时重点看：

1. handler / controller 的请求结构
2. 哪些字段是必填
3. 哪些字段影响分支
4. 哪些字段依赖前一接口结果

## 第四步：把请求拆成“最小可执行版本”

推导请求时，遵循一个原则：

- 先够用，再补分支字段

也就是：

1. 先构造能打通接口的最小请求
2. 再补足影响当前验收场景的字段

## 这次案例里真正被推导出来的关键字段

### `GetPetElfCfg`

除了用户最开始说的“第一次 / 第二次进入会话”之外，真正落到请求里还需要：

- `UserID`
- `Aid`
- `DeviceID`
- `HasWidget`
- `Version`
- `Extra.conversation_short_id`
- 第二次调用时的 `Extra.widget`

### `GetWidget`

真正落到请求里需要：

- `UserId`
- `Aid`
- `DeviceId`
- `ConversationShortID`
- `HasWidget`

## 这一步的结论

从“宏观预期”到“请求体”的关键中间层，不是最终结果，而是：

1. 找到接口顺序
2. 找到验证点
3. 查代码补字段
4. 构造第一版请求

真正的请求文件见：

- 存量用户：`artifacts/stock/`
- 新增用户：`artifacts/new/`
