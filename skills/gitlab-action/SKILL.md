---
name: gitlab-action
description: GitLab 操作技能：对代码仓库 NextCode OpenAPI 的完整封装，提供 Repository、Merge Request、Review、Comment、Branch、User 等全部能力。
---

## 触发准则

- 需要操作代码仓库（获取仓库信息、文件、commit、分支等）
- 需要创建/查询/更新/合并 Merge Request
- 需要获取 MR diff、评论、评审状态、可合入性、check runs
- 需要创建/获取/更新/删除评论或 review
- 需要获取当前用户信息
- MR checklist + 失败日志聚合

## 使用前必读

- **入口脚本**：`node ./scripts/gitlab-action.js <command> [options]`
- **凭证**：`NEXTCODE_TOKEN` 会自动注入。
- **Runner 日志凭证**：`check-run mr-checklist` 内部会拉取 runner log，需要 `TMATES_JWT`。
- **repo-path 默认值**：大部分命令支持 `--repo-path`，默认从 git remote origin 解析。

## 可用命令

---

### Repository 仓库操作

#### 获取当前分支名
```bash
repo current-branch
```

#### 获取当前仓库路径（从 git remote origin 解析）
```bash
repo name
```

#### 获取仓库信息 (GetRepository)
```bash
repo get [--repo-path <repoPath>] [--with-permissions <boolean>]
```

#### 更新仓库元信息 (UpdateRepository)
```bash
repo update [--name <name>] [--description <description>] [--repo-path <repoPath>]
```

#### 条件筛选多个仓库 (ListRepositories)
```bash
repo list [--query <query>] [--page-number <n>] [--page-size <n>] [--starred <boolean>] [--sort-by <field>] [--sort-order <Asc|Desc>]
```

#### 获取仓库 commit (GetCommit)
```bash
repo get-commit --revision <revision> [--repo-path <repoPath>]
```

#### 获取仓库 commits (ListCommits)
```bash
repo list-commits --revision <revision> [--path <filePath>] [--page-number <n>] [--page-size <n>] [--query <query>] [--repo-path <repoPath>]
```

#### 获取仓库文件信息及内容 (GetFile)
```bash
repo get-file --revision <revision> --path <filePath> [--repo-path <repoPath>]
```

#### 创建或更新仓库文件 (CreateOrUpdateFiles)
```bash
repo create-or-update-files --branch <branch> --commit-message <message> --files <json> [--start-branch <branch>] [--repo-path <repoPath>]
```
- `--files`: JSON 数组，格式 `[{"ActionType":"create|update|delete","Path":"file.txt","Content":"...","Encoding":"text|base64"}]`
- `--start-branch`: 从此分支创建新分支并提交

---

### Branch 分支操作

#### 获取默认分支 (GetDefaultBranch)
```bash
branch default [--repo-path <repoPath>]
```

#### 获取仓库分支列表 (ListBranches)
```bash
branch list [--query <query>] [--page-number <n>] [--page-size <n>] [--repo-path <repoPath>]
```

#### 创建分支 (CreateBranch)
```bash
branch create --name <branchName> --revision <revision> [--repo-path <repoPath>]
```

#### 删除分支 (DeleteBranch)
```bash
branch delete --name <branchName> [--repo-path <repoPath>]
```

---

### Merge Request 操作

#### 获取 MR (GetMergeRequest)
```bash
merge-request get --merge-request-id <id> [--with-version <boolean>] [--repo-path <repoPath>]
```

#### 列出仓库 MR (ListMergeRequests)
```bash
merge-request list [--status <open|closed|merged>] [--page-number <n>] [--page-size <n>] [--repo-path <repoPath>]
```

#### 创建 MR (CreateMergeRequest)
```bash
merge-request create --source-branch <branch> --target-branch <branch> --title <title> [--description <desc>] [--merge-method <method>] [--remove-source-branch-after-merge <boolean>] [--squash-commits <boolean>] [--reviewer-ids <ids>] [--source-repo-path <path>] [--target-repo-path <path>]
```
- 多行描述请使用 HEREDOC 传入 `--description`，避免单行字面量 `\n` 导致页面显示 `\n`。
- 推荐写法：
  ```bash
  merge-request create ... --description "$(cat <<'EOF'
  ## 变更说明
  - 第一行
  - 第二行
  EOF
  )"
  ```

#### 更新 MR (UpdateMergeRequest)
```bash
merge-request update --merge-request-id <id> [--title <title>] [--description <desc>] [--target-branch <branch>] [--merge-method <method>] [--remove-source-branch-after-merge <boolean>] [--squash-commits <boolean>] [--auto-merge <boolean>] [--draft <boolean>] [--repo-path <repoPath>]
```

#### 合并 MR (MergeMergeRequest)
```bash
merge-request merge --merge-request-id <id> [--merge-method <method>] [--remove-source-branch-after-merge <boolean>] [--squash-commits <boolean>] [--merge-commit-message <msg>] [--squash-commit-message <msg>] [--repo-path <repoPath>]
```

#### 获取 MR 可合入情况 (GetMergeRequestMergeability)
```bash
merge-request mergeability --merge-request-id <id> [--repo-path <repoPath>]
```

#### 关闭 MR (CloseMergeRequest)
```bash
merge-request close --merge-request-id <id> [--repo-path <repoPath>]
```

---

### Diff 变更操作

#### 获取 Diff commits (ListDiffCommits)
```bash
diff commits --from-commit <sha> --to-commit <sha> [--is-straight <boolean>] [--page-number <n>] [--page-size <n>] [--with-total-count <boolean>] [--repo-path <repoPath>]
```

#### 获取 Diff 文件列表 (ListDiffFiles)
```bash
diff files --from-commit <sha> --to-commit <sha> [--is-straight <boolean>] [--raw-stat-only <boolean>] [--repo-path <repoPath>]
```

#### 获取 Diff 文件内容 (ListDiffFileContents)
```bash
diff contents --from-commit <sha> --to-commit <sha> [--is-straight <boolean>] [--files <paths>] [--ignore-whitespaces <boolean>] [--context <lines>] [--max-patch-bytes <bytes>] [--repo-path <repoPath>]
```

#### 通过分支获取 Diff (by-branch)
```bash
diff by-branch --source-branch <branch> [--target-branch <branch>] [--is-straight <boolean>] [--files <paths>] [--ignore-whitespaces <boolean>] [--context <lines>] [--max-patch-bytes <bytes>] [--repo-path <repoPath>]
```

#### 通过 MR URL 获取 Diff (by-url)
```bash
diff by-url --merge-request-url <url> [--is-straight <boolean>] [--files <paths>] [--ignore-whitespaces <boolean>] [--context <lines>] [--max-patch-bytes <bytes>]
```

---

### Comment 评论操作

#### 创建评论 (CreateComment)
```bash
comment create --commentable-type <merge_request|commit> --commentable-id <id> --content <content> [--repo-path <repoPath>]
```

#### 获取评论 (GetComment)
```bash
comment get --comment-id <id> [--repo-path <repoPath>]
```

#### 列出评论线程 (ListThreads)
```bash
comment list --commentable-type <merge_request|commit> --commentable-id <id> [--commit-id <id>] [--repo-path <repoPath>]
```

#### 通过 MR URL 列出评论线程
```bash
comment by-url --merge-request-url <url> [--commit-id <id>]
```

#### 更新评论 (UpdateComment)
```bash
comment update --comment-id <id> --content <content> [--repo-path <repoPath>]
```

#### 删除评论 (DeleteComment)
```bash
comment delete --comment-id <id> [--repo-path <repoPath>]
```

---

### Review 评审操作

#### 获取评审状态 (GetReviewStatus)
```bash
review status --merge-request-id <id> [--repo-path <repoPath>]
```

#### 创建 Review (CreateReview)
```bash
review create --merge-request-id <id> --commit-id <commitId> --status <status> [--content <content>] [--reset-approval-after-rework <boolean>] [--publish-draft-comments <boolean>] [--repo-path <repoPath>]
```

#### 更新 Reviewers (UpdateReviewers)
```bash
review update-reviewers --merge-request-id <id> [--add-reviewer-ids <ids>] [--remove-reviewer-ids <ids>] [--repo-path <repoPath>]
```

---

### User 用户操作

#### 获取个人信息 (GetMe)
```bash
user me
```

---

### Check Run 检查操作

#### 列出 Check Runs (ListCheckRuns)
```bash
check-run list --commit-id <commitId> [--page-number <n>] [--page-size <n>] [--repo-path <repoPath>]
```

#### 获取 Check Run (GetCheckRun)
```bash
check-run get --check-run-id <id> [--repo-path <repoPath>]
```

#### 创建 Check Run (CreateCheckRun)
```bash
check-run create --commit-id <commitId> --name <name> --status <status> [--conclusion <conclusion>] [--repo-path <repoPath>]
```

#### 更新 Check Run (UpdateCheckRun)
```bash
check-run update --check-run-id <id> [--status <status>] [--conclusion <conclusion>] [--description <desc>] [--text <text>] [--repo-path <repoPath>]
```

#### 获取分支最新 Check Run 日志
```bash
check-run latest-log --branch <branch> [--page-size <n>] [--repo-path <repoPath>]
```

#### MR checklist + 失败日志聚合
```bash
check-run mr-checklist --branch <branch> [--page-size <n>] --repo-path <repoPath> [--mr-status <status>]
```
- 自动解析 MR → CheckRun → Leafboat Job ID → runner logs
- 需要 `TMATES_JWT` 凭证

---

### Runner Log 日志操作

#### 获取 Runner 日志
```bash
runner-log get --job-run-id <id> [--job-run-seq <seq>] [--pipeline-run-id <id>] [--step-id <id>] [--step-name <name>] [--step-index <index>] [--all-steps] [--tail-lines <n>] [--page-size <n>]
```
- 默认返回失败步骤日志，无失败则返回最后一步
- `--all-steps`: 返回所有步骤日志
- 需要 `TMATES_JWT` 凭证
