# 00. 原始宏观预期

## 用户最开始给出的不是完整验收文档

最开始拿到的信息并不细，核心只是一个宏观预期：

### 存量用户

1. 第一次进入会话，会主动调用 `GetPetElfCfg`
2. 如果发现有新增 widget 资源，会返回 `NeedUpdateWidget=true`
3. 然后客户端会调用 `UpdateWidget`
4. 生成资源后再调 `GetWidget`
5. 第二次进入会话时，再调 `GetPetElfCfg`
6. 这时应该返回 `NeedUpdateWidget=false`

### 新增用户

1. 第一次进入会话，会主动调用 `GetPetElfCfg`
2. 首次生成场景下，应返回 `NeedUpdateWidget=true`
3. 然后客户端会调用 `UpdateWidget`
4. 生成资源后再调 `GetWidget`
5. 第二次进入会话时，再调 `GetPetElfCfg`
6. 这时应该返回 `NeedUpdateWidget=false`

## 这时还不知道什么

在这个阶段，其实还不知道：

1. 每个接口的完整请求体是什么
2. 哪些字段必须传
3. 用户和会话应该用谁
4. `GetWidget` 里哪些 widget 应该出现
5. 如果结果不对，应该查配置、查代码还是查日志

所以这一步不能直接写最终验收文档，只能先把“用户原始预期”记录下来。

## 这一步的输出

这里的输出不是请求体，而是一个待验证的链路：

`GetPetElfCfg -> UpdateWidget -> GetWidget -> GetPetElfCfg`

下一步要做的，才是去推导这些请求该怎么构造。
