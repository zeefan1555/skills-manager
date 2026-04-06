举例说明：如何调用别人的RPC接口获取 user device
### 背景
- GetIncubatingPetCfg 接口中上游没有传入 user_device，需要social.pet 服务来自己调用外部服务(toutiao_passport_id_relation)来获取 user_device
<image token="OGGNbjQbeocSuExLwCEcCdlZn7g" width="1324" height="2162" align="left"/>


### 如何获取调用新服务的代码库
- psm: toutiao.passport.id_relation ⇒  overpass/toutiao_passport_id_relation是由overpass自动生成的 仓库（注意命名规则，把点换成下划线，然后在bits_code 上就可以搜索到）
- [ByteDance SSO](https%3A%2F%2Fcode.byted.org%2Foverpass%2Ftoutiao_passport_id_relation)
- overpass可以**全自动地**为每个服务创建一个代码仓库，路径为[https://code.byted.org/overpass/P_S_M](https%3A%2F%2Fcode.byted.org%2Foverpass)，里面包含了所有自动生成的kitex_gen、Client的创建、常用通用能力的封装实现、通用的错误处理等。不仅如此，当服务的IDL发生变化时，overpass还能够感知并自动更新仓库中的代码。
### 申请权限
- User Device 关系服务使用说明：[https://bytedance.larkoffice.com/wiki/wikcnrzfcEoHbuZCuHWoDmVxgdc](https%3A%2F%2Fbytedance.larkoffice.com%2Fwiki%2FwikcnrzfcEoHbuZCuHWoDmVxgdc)
- 访问 user_device 授权（严格授权申请）：[BPM](https%3A%2F%2Fbpm.bytedance.net%2Frecord%2F85270258)
- 申请RPC访问权限申请（toutiao.passport.id_relation）： 
  - [ByteCloud - One-stop development platform for ByteDancer](https%3A%2F%2Fcloud.bytedance.net%2Fneptune%2Fsecure%2Facl%2Fapply%3Fcluster%3Ddefault%26method%3D%252A%26mode%3DEgress%26psm%3Dttgame.social.pet%26rpc_meta%5B%5D%3D%257B%2522caller%2522%253A%2522ttgame.social.pet%2522%252C%2522caller_cluster%2522%253A%2522default%2522%252C%2522callee%2522%253A%2522toutiao.passport.id_relation%2522%252C%2522callee_cluster%2522%253A%2522default%2522%252C%2522method%2522%253A%2522MGetUserDevice%2522%252C%2522psm%2522%253A%2522toutiao.passport.id_relation%2522%252C%2522cluster%2522%253A%2522default%2522%257D%26x-bc-region-id%3Dbytedance%26x-resource-account%3Dpublic%26zone%3DCN)
  - 
  <image token="ICyqbbbAfoAdW2xKrWLcoE9On9c" width="3080" height="1704"/>

  <image token="YaB7bTT2aobH0nxmpfdcxVFPnoe" width="2892" height="1620"/>

### 代码实现
<quote-container>
social.pet 仓库
</quote-container>

- 具体例子实现详见：
- GetIncubatingPetCfg⇒GetConversationUserDevice⇒GetConversationUserDevice⇒MGetUserDevice

