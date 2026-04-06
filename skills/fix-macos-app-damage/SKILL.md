---
name: fix-macos-app-damage
description: Use when a downloaded macOS app will not open and Gatekeeper, code signing, or LaunchServices errors are involved, especially for warnings about damage, malware checks, missing executables, or broken app registration.
---

# Fix macOS App Launch Failures

## Overview

Many "app is damaged" reports are not real file corruption. The common causes are:
- quarantine attributes from a browser download
- a broken or stripped code signature
- LaunchServices or Spotlight failing to recognize a valid `.app` bundle

Diagnose first. Do not default to `xattr -cr` if the error already points at code signing or app registration.

## When to Use

**Common symptoms:**
- "已损坏，无法打开。你应该将它移到废纸篓。"
- "Apple 无法验证 ... 是否包含恶意软件。"
- `codesign --verify` fails
- `spctl -a -vv` fails
- `open /path/App.app` returns `kLSNoExecutableErr`
- `lsregister` reports `-10822 from spotlight`

**Do not use for:**
- apps that open and then crash
- real binary corruption confirmed by missing files
- runtime dependency or entitlement bugs after launch

## Quick Triage

Run these first:

```bash
xattr -l "/path/App.app"
codesign --verify --deep --strict --verbose=2 "/path/App.app"
spctl -a -vv "/path/App.app"
open "/path/App.app"
```

Interpret the result:

| Signal | Meaning | Next step |
|---|---|---|
| `com.apple.quarantine` exists | Download quarantine | Remove quarantine |
| `invalid signature` | Signature is broken | Re-sign local copy |
| `resource fork ... not allowed` or `Disallowed xattr` | Extra metadata breaks strict validation | Clear the offending xattr and verify again |
| `kLSNoExecutableErr` but executable exists | LaunchServices is confused | Check Spotlight and app registration |
| App bundle is actually missing files | Real damage | Reinstall from trusted source |

## Implementation

### 1. Locate and inspect the app

```bash
ls -d /Applications/AppName.app "$HOME/Applications/AppName.app" 2>/dev/null
ls -l "/path/App.app/Contents/MacOS"
plutil -p "/path/App.app/Contents/Info.plist" | grep CFBundleExecutable
```

If the main executable or `Info.plist` is missing, stop and reinstall from a trusted source.

### 2. Remove quarantine when present

Use this only when the app still carries internet-download attributes:

```bash
xattr -cr "/path/App.app"
xattr -l "/path/App.app"
```

Expected result: `com.apple.quarantine` is gone.

### 3. Re-sign a broken local copy

If verification says the signature is invalid but the bundle contents are intact, ad-hoc sign the local copy:

```bash
codesign --force --deep --sign - "/path/App.app"
codesign --verify --deep --strict --verbose=2 "/path/App.app"
```

Use this for local recovery only. It replaces the vendor signature with an ad-hoc signature.

### 3.5. Remove disallowed metadata after signing

If strict verification fails with `resource fork ... not allowed` or `Disallowed xattr`, remove the offending attribute and verify again:

```bash
xattr -l "/path/App.app"
xattr -d com.apple.FinderInfo "/path/App.app"
codesign --verify --deep --strict --verbose=2 "/path/App.app"
```

### 4. Repair LaunchServices symptoms

If `open` says `kLSNoExecutableErr` even though the executable exists:

```bash
mdutil -s /
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "/path/App.app"
```

If `mdutil -s /` says `Spotlight server is disabled`, LaunchServices may fail to register apps correctly. Re-enable Spotlight before trusting `lsregister` results.

### 5. Fall back to a clean reinstall

If the bundle still will not open after quarantine removal and re-signing:
- delete the broken copy
- re-download from the official source
- copy to `/Applications`
- repeat the triage commands

## Common Mistakes

| Mistake | Fix |
|---|---|
| Treating every warning as quarantine-only | Run `codesign --verify` before deciding |
| Re-signing before checking files exist | Confirm `Contents/MacOS/<binary>` and `Info.plist` first |
| Ignoring `Disallowed xattr` after re-signing | Remove the reported xattr and rerun strict verification |
| Blaming the app when `lsregister` is failing system-wide | Check `mdutil -s /` and Spotlight state |
| Running the app from a DMG | Copy to `/Applications` first |

## Verification

Use fresh evidence before declaring success:

```bash
xattr -l "/path/App.app"
codesign --verify --deep --strict --verbose=2 "/path/App.app"
open "/path/App.app"
```

The app is recovered only when:
- quarantine is removed when needed
- signature verification passes or the reinstall restores the vendor signature
- `open` no longer reports LaunchServices errors
