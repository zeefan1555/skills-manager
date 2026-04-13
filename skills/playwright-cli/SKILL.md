---
name: playwright-cli
description: Automate browser interactions, test web pages and work with Playwright tests.
allowed-tools: Bash(playwright-cli:*) Bash(npx:*) Bash(npm:*)
---

# Browser Automation with playwright-cli

## Local default

For this machine, prefer the persistent profile at `~/.playwright-cli-profiles/zeefan` whenever using `open`, unless the user explicitly asks for a different profile or wants an isolated temporary session.

Before creating a new browser session, first check whether there is already a running session you can reuse:

1. Run `playwright-cli list`
2. If an existing session is already `open` and is using `~/.playwright-cli-profiles/zeefan`, prefer reusing that session
3. On a reused session, prefer `tab-new`, `tab-select`, `goto`, and other tab/page commands instead of creating a second session on the same profile
4. If you opened a temporary tab on a reused session for a task, close that tab when the task is finished so tabs do not accumulate
5. Only run `open` when no suitable running session exists, or when the user explicitly wants an isolated session

Important local rule:

- Do **not** create multiple concurrently running sessions that share `~/.playwright-cli-profiles/zeefan` unless the user explicitly asks for that risk.
- On this machine, the interactive zsh wrapper is allowed to bind `playwright-cli close-all` to attach cleanup; ordinary `close` should not trigger attach cleanup automatically.
- The profile path matters more than the session name. Reusing one running session on the `zeefan` profile is preferred over creating many differently named sessions on that same profile.
- If a task temporarily opens an extra tab on a reused session, clean it up with `tab-close` after the task unless the user explicitly wants to keep it open.

Default open pattern:

```bash
playwright-cli -s=zeefan open --browser=chrome --profile="$HOME/.playwright-cli-profiles/zeefan"
```

Default open with URL:

```bash
playwright-cli -s=zeefan open "https://example.com" --browser=chrome --profile="$HOME/.playwright-cli-profiles/zeefan"
```

Default reuse pattern when `zeefan` is already running:

```bash
playwright-cli list
playwright-cli -s=zeefan tab-new "https://example.com"
playwright-cli -s=zeefan tab-select 0
# ...finish the task...
playwright-cli -s=zeefan tab-close
```

Use `attach --extension` instead when the goal is to take over the user's currently running Chrome session and reuse the live page/context directly.

## Quick start

```bash
# first inspect whether a reusable session is already running
playwright-cli list
# if none exists, open the default persistent browser profile
playwright-cli -s=zeefan open --browser=chrome --profile="$HOME/.playwright-cli-profiles/zeefan"
# navigate to a page on the active session
playwright-cli -s=zeefan goto https://playwright.dev
# interact with the page using refs from the snapshot
playwright-cli -s=zeefan click e15
playwright-cli -s=zeefan type "page.click"
playwright-cli -s=zeefan press Enter
# take a screenshot (rarely used, as snapshot is more common)
playwright-cli -s=zeefan screenshot
# close the browser
playwright-cli -s=zeefan close
```

## Commands

### Core

```bash
# first inspect whether a reusable session is already running
playwright-cli list
# if no suitable running session exists, open one on the zeefan profile
playwright-cli -s=zeefan open --browser=chrome --profile="$HOME/.playwright-cli-profiles/zeefan"
# open and navigate right away
playwright-cli -s=zeefan open https://example.com/ --browser=chrome --profile="$HOME/.playwright-cli-profiles/zeefan"
playwright-cli -s=zeefan goto https://playwright.dev
playwright-cli -s=zeefan type "search query"
playwright-cli -s=zeefan click e3
playwright-cli -s=zeefan dblclick e7
# --submit presses Enter after filling the element
playwright-cli -s=zeefan fill e5 "user@example.com"  --submit
playwright-cli -s=zeefan drag e2 e8
playwright-cli -s=zeefan hover e4
playwright-cli -s=zeefan select e9 "option-value"
playwright-cli -s=zeefan upload ./document.pdf
playwright-cli -s=zeefan check e12
playwright-cli -s=zeefan uncheck e12
playwright-cli -s=zeefan snapshot
playwright-cli -s=zeefan eval "document.title"
playwright-cli -s=zeefan eval "el => el.textContent" e5
# get element id, class, or any attribute not visible in the snapshot
playwright-cli -s=zeefan eval "el => el.id" e5
playwright-cli -s=zeefan eval "el => el.getAttribute('data-testid')" e5
playwright-cli -s=zeefan dialog-accept
playwright-cli -s=zeefan dialog-accept "confirmation text"
playwright-cli -s=zeefan dialog-dismiss
playwright-cli -s=zeefan resize 1920 1080
playwright-cli -s=zeefan close
```

### Navigation

```bash
playwright-cli go-back
playwright-cli go-forward
playwright-cli reload
```

### Keyboard

```bash
playwright-cli press Enter
playwright-cli press ArrowDown
playwright-cli keydown Shift
playwright-cli keyup Shift
```

### Mouse

```bash
playwright-cli mousemove 150 300
playwright-cli mousedown
playwright-cli mousedown right
playwright-cli mouseup
playwright-cli mouseup right
playwright-cli mousewheel 0 100
```

### Save as

```bash
playwright-cli screenshot
playwright-cli screenshot e5
playwright-cli screenshot --filename=page.png
playwright-cli pdf --filename=page.pdf
```

### Tabs

```bash
playwright-cli -s=zeefan tab-list
playwright-cli -s=zeefan tab-new
playwright-cli -s=zeefan tab-new https://example.com/page
playwright-cli -s=zeefan tab-close
playwright-cli -s=zeefan tab-close 2
playwright-cli -s=zeefan tab-select 0
```

### Storage

```bash
playwright-cli -s=zeefan state-save
playwright-cli -s=zeefan state-save auth.json
playwright-cli -s=zeefan state-load auth.json

# Cookies
playwright-cli -s=zeefan cookie-list
playwright-cli -s=zeefan cookie-list --domain=example.com
playwright-cli -s=zeefan cookie-get session_id
playwright-cli -s=zeefan cookie-set session_id abc123
playwright-cli -s=zeefan cookie-set session_id abc123 --domain=example.com --httpOnly --secure
playwright-cli -s=zeefan cookie-delete session_id
playwright-cli -s=zeefan cookie-clear

# LocalStorage
playwright-cli -s=zeefan localstorage-list
playwright-cli -s=zeefan localstorage-get theme
playwright-cli -s=zeefan localstorage-set theme dark
playwright-cli -s=zeefan localstorage-delete theme
playwright-cli -s=zeefan localstorage-clear

# SessionStorage
playwright-cli -s=zeefan sessionstorage-list
playwright-cli -s=zeefan sessionstorage-get step
playwright-cli -s=zeefan sessionstorage-set step 3
playwright-cli -s=zeefan sessionstorage-delete step
playwright-cli -s=zeefan sessionstorage-clear
```

### Network

```bash
playwright-cli -s=zeefan route "**/*.jpg" --status=404
playwright-cli -s=zeefan route "https://api.example.com/**" --body='{"mock": true}'
playwright-cli -s=zeefan route-list
playwright-cli -s=zeefan unroute "**/*.jpg"
playwright-cli -s=zeefan unroute
```

### DevTools

```bash
playwright-cli -s=zeefan console
playwright-cli -s=zeefan console warning
playwright-cli -s=zeefan network
playwright-cli -s=zeefan run-code "async page => await page.context().grantPermissions(['geolocation'])"
playwright-cli -s=zeefan run-code --filename=script.js
playwright-cli -s=zeefan tracing-start
playwright-cli -s=zeefan tracing-stop
playwright-cli -s=zeefan video-start video.webm
playwright-cli -s=zeefan video-chapter "Chapter Title" --description="Details" --duration=2000
playwright-cli -s=zeefan video-stop
```

## Raw output

The global `--raw` option strips page status, generated code, and snapshot sections from the output, returning only the result value. Use it to pipe command output into other tools. Commands that don't produce output return nothing.

```bash
playwright-cli --raw eval "JSON.stringify(performance.timing)" | jq '.loadEventEnd - .navigationStart'
playwright-cli --raw eval "JSON.stringify([...document.querySelectorAll('a')].map(a => a.href))" > links.json
playwright-cli --raw snapshot > before.yml
playwright-cli click e5
playwright-cli --raw snapshot > after.yml
diff before.yml after.yml
TOKEN=$(playwright-cli --raw cookie-get session_id)
playwright-cli --raw localstorage-get theme
```

## Open parameters
```bash
# Use specific browser when creating session
playwright-cli -s=zeefan open --browser=chrome --profile="$HOME/.playwright-cli-profiles/zeefan"
playwright-cli open --browser=firefox
playwright-cli open --browser=webkit
playwright-cli open --browser=msedge

# Use persistent profile (by default profile is in-memory)
playwright-cli open --persistent
# Use persistent profile with custom directory
playwright-cli open --profile=/path/to/profile

# Local preferred default on this machine
playwright-cli -s=zeefan open --browser=chrome --profile="$HOME/.playwright-cli-profiles/zeefan"

# Connect to browser via extension
playwright-cli attach --extension

# Start with config file
playwright-cli open --config=my-config.json

# Close the browser
playwright-cli close
# Delete user data for the default session
playwright-cli delete-data
```

## Snapshots

After each command, playwright-cli provides a snapshot of the current browser state.

```bash
> playwright-cli goto https://example.com
### Page
- Page URL: https://example.com/
- Page Title: Example Domain
### Snapshot
[Snapshot](.playwright-cli/page-2026-02-14T19-22-42-679Z.yml)
```

You can also take a snapshot on demand using `playwright-cli snapshot` command. All the options below can be combined as needed.

```bash
# default - save to a file with timestamp-based name
playwright-cli snapshot

# save to file, use when snapshot is a part of the workflow result
playwright-cli snapshot --filename=after-click.yaml

# snapshot an element instead of the whole page
playwright-cli snapshot "#main"

# limit snapshot depth for efficiency, take a partial snapshot afterwards
playwright-cli snapshot --depth=4
playwright-cli snapshot e34
```

## Targeting elements

By default, use refs from the snapshot to interact with page elements.

```bash
# get snapshot with refs
playwright-cli snapshot

# interact using a ref
playwright-cli click e15
```

You can also use css selectors or Playwright locators.

```bash
# css selector
playwright-cli click "#main > button.submit"

# role locator
playwright-cli click "getByRole('button', { name: 'Submit' })"

# test id
playwright-cli click "getByTestId('submit-button')"
```

## Browser Sessions

```bash
# first inspect whether a reusable session is already running
playwright-cli list

# preferred local session named "zeefan" with persistent profile
playwright-cli -s=zeefan open example.com --browser=chrome --profile="$HOME/.playwright-cli-profiles/zeefan"
# if `zeefan` is already running, prefer opening a new tab instead of opening another session on the same profile
playwright-cli -s=zeefan tab-new https://example.com/other
playwright-cli -s=zeefan tab-select 0
# same with manually specified profile directory (use when requested explicitly)
playwright-cli -s=mysession open example.com --profile=/path/to/profile
playwright-cli -s=mysession click e6
playwright-cli -s=mysession close  # stop a named browser
playwright-cli -s=mysession delete-data  # delete user data for persistent session

# Close all browsers
playwright-cli close-all
# Forcefully kill all browser processes
playwright-cli kill-all
```

## Installation

If global `playwright-cli` command is not available, try a local version via `npx playwright-cli`:

```bash
npx --no-install playwright-cli --version
```

When local version is available, use `npx playwright-cli` in all commands. Otherwise, install `playwright-cli` as a global command:

```bash
npm install -g @playwright/cli@latest
```

## Example: Form submission

```bash
playwright-cli list
playwright-cli -s=zeefan tab-new https://example.com/form
playwright-cli -s=zeefan snapshot

playwright-cli -s=zeefan fill e1 "user@example.com"
playwright-cli -s=zeefan fill e2 "password123"
playwright-cli -s=zeefan click e3
playwright-cli -s=zeefan snapshot
playwright-cli -s=zeefan tab-close
```

## Example: Multi-tab workflow

```bash
playwright-cli list
playwright-cli -s=zeefan tab-new https://example.com
playwright-cli -s=zeefan tab-new https://example.com/other
playwright-cli -s=zeefan tab-list
playwright-cli -s=zeefan tab-select 0
playwright-cli -s=zeefan snapshot
# close temporary tabs after the task if they were opened only for this run
playwright-cli -s=zeefan tab-close
playwright-cli -s=zeefan tab-close
```

## Example: Debugging with DevTools

```bash
playwright-cli list
playwright-cli -s=zeefan tab-new https://example.com
playwright-cli -s=zeefan click e4
playwright-cli -s=zeefan fill e7 "test"
playwright-cli -s=zeefan console
playwright-cli -s=zeefan network
playwright-cli -s=zeefan tab-close
```

```bash
playwright-cli list
playwright-cli -s=zeefan tab-new https://example.com
playwright-cli -s=zeefan tracing-start
playwright-cli -s=zeefan click e4
playwright-cli -s=zeefan fill e7 "test"
playwright-cli -s=zeefan tracing-stop
playwright-cli -s=zeefan tab-close
```

## Specific tasks

* **Running and Debugging Playwright tests** [references/playwright-tests.md](references/playwright-tests.md)
* **Request mocking** [references/request-mocking.md](references/request-mocking.md)
* **Running Playwright code** [references/running-code.md](references/running-code.md)
* **Browser session management** [references/session-management.md](references/session-management.md)
* **Storage state (cookies, localStorage)** [references/storage-state.md](references/storage-state.md)
* **Test generation** [references/test-generation.md](references/test-generation.md)
* **Tracing** [references/tracing.md](references/tracing.md)
* **Video recording** [references/video-recording.md](references/video-recording.md)
* **Inspecting element attributes** [references/element-attributes.md](references/element-attributes.md)
