# Social Pet Tools Env Reference

## 说明

- 本文件维护 `branch -> env config` 映射
- 一个分支对应一组固定环境字段
- 开发前先确认当前 git branch，再查对应分支块
- 固定字段统一使用：`topic`、`ppe`、`cds_path`、`tables`、`tcc_env`、`tcc_key`、`aid`、`test_accounts`、`conversation_id`
- 可选扩展字段使用：`notes`、`extra`

## Branch Env Mapping

### branch: `feat_widget_feed_chat_test`

- topic: `widget-config-and-food-const`
- ppe: `ppe_tab_template`
- cds_path: `/Users/bytedance/bytecode/im_pet/ppe_tab_template`
- tables:
  - `WidgetCfg.xlsx`
  - `FoodConstCfg.xlsx`
- tcc_env: `ppe_tab_template`
- tcc_key: `WidgetConfig`
- aid: `1128`
- test_accounts:
  - case: `hit_experiment`
    uid: `4196178329875469`
    did: `1391327338308871`
  - case: `miss_experiment`
    uid: `4477653324664615`
    did: `649136499878756`
- conversation_id: `7606088834656338478`
- notes: `构造请求体时默认优先使用本分支下的测试账号与会话信息`

## 新分支模板

### branch: `<new-branch-name>`

- topic: `<topic>`
- ppe: `<ppe env>`
- cds_path: `<cds path>`
- tables:
  - `<table 1>`
- tcc_env: `<tcc env>`
- tcc_key: `<tcc key>`
- aid: `<aid>`
- test_accounts:
  - case: `<account case>`
    uid: `<uid>`
    did: `<did>`
- conversation_id: `<conversation id>`
- notes: `<optional notes>`
- extra:
  - `<optional extra item>`

## 使用提醒

- 每次进入 `social-pet-tools` 先读本文件
- 先确认当前分支，再查对应配置块
- 新需求通过新增分支块维护，不覆盖其他分支
- 固定字段尽量保持一致，仅在必要时补充可选扩展
