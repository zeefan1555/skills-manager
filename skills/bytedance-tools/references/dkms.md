# DKMS (Data Key Management Service)

```bash
# 获取密钥信息（VA 区域）
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --site i18n-tt dkms get-key <dataKeyName> --region va

# 获取密钥信息（SG 区域）
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --site i18n-tt dkms get-key <dataKeyName> --region sg

# 获取密钥信息（EU 区域）
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --site i18n-tt dkms get-key <dataKeyName> --region eu

# 获取密钥信息（BOE-I18N 区域，使用 boei18n 站点）
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --site boei18n dkms get-key <dataKeyName> --region boei18n

# 列出密钥权限
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --site i18n-tt dkms list-permissions <dataKeyName> --region va

# 检查实体权限
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --site i18n-tt dkms check-permission <dataKeyName> --entity-name <serviceOrEmployee> --entity-type <service|employee> --region va

# 添加服务权限
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --site i18n-tt dkms add-permission <dataKeyName> --entity-name <serviceName> --entity-type service --region va

# 添加员工权限
NPM_CONFIG_REGISTRY=http://bnpm.byted.org npx -y @bytedance-dev/bytedcli@latest --site i18n-tt dkms add-permission <dataKeyName> --entity-name <username> --entity-type employee --region va
```

## 区域与站点对应关系

- VA/SG/EU（TikTok ROW）：使用 `--site i18n-tt`
- BOE-I18N：使用 `--site boei18n`

## 实体类型

- `service`：服务标识（如 `my.service.name`）
- `employee`：员工用户名（如 `alice`）
