# Login

## 何时读取

- 用户要登录 NotebookLM CLI
- 用户要切换账号 / profile
- CLI 报认证失败、cookie 失效、账户不对

## 最小流程

```bash
nlm login
nlm login --check
```

如果需要多个账号：

```bash
nlm login --profile work
nlm login switch work
nlm login profile list
```

## 常用命令

```bash
nlm login                         # 浏览器登录
nlm login --check                 # 检查当前默认 profile 是否有效
nlm login --profile work          # 用命名 profile 登录
nlm login switch <profile>        # 切换默认 profile
nlm login profile list            # 列出 profile 和邮箱
nlm login profile rename <old> <new>
nlm login profile delete <name>
```

## 诊断顺序

1. 先跑 `nlm login --check`
2. 再跑 `nlm doctor`
3. 确认当前 profile 是否是预期账号
4. 再决定是否重新 `nlm login`

## 常见问题

- **显示已登录但账号不对**：用 `nlm login profile list` 看邮箱，再用 `nlm login switch <profile>`
- **需要切换 Google 账号**：用 `--profile` 新建隔离登录，必要时结合 `--clear`
- **自动化浏览器环境**：需要外部 CDP 时使用 `--provider openclaw --cdp-url ...`

## 注意

- 不要在未确认当前 profile 的情况下直接执行写操作
- 若用户只想“测试 CLI 登录是否正常”，优先执行 `nlm login --check`
