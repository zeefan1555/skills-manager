# TCC Rollback Bundle

## Target

- `namespace`: `ttgame.social.pet`
- `config_name`: `WidgetConfig`
- `env`: `ppe_tab_template`
- `region`: `CN`
- `dir`: `/default`
- `site`: `cn` (default)

## Change

- Field: `check_white_list`
- Action: remove `"7610720767763841588"` (string) from list
- Rollback strategy: minimal change (only this field), keep other keys unchanged

## Results

- `update-config`: success (base_version: 12)
- `deploy-config`: success, version `12 -> 13`
- `need_review`: false
- `deployment_id`: `2829922154110960`
- `console_url`: https://cloud.bytedance.net/tcc/namespace/ttgame.social.pet/publish-details/2829922154110960

## Verification

- `online_version.version`: `13`
- `check_white_list`: `[]`

## Evidence Files

- `tcc_WidgetConfig_ppe_tab_template_get.json`
- `tcc_WidgetConfig_ppe_tab_template_before_base.json`
- `tcc_WidgetConfig_ppe_tab_template_after_base.json`
- `tcc_WidgetConfig_ppe_tab_template_update.json`
- `tcc_WidgetConfig_ppe_tab_template_deploy.json`
- `tcc_WidgetConfig_ppe_tab_template_verify_get.json`

