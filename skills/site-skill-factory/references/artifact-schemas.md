# Artifact Schemas

These artifacts are the minimum build contract for a generated site skill.

## `site-profile.json`

Purpose:

- Describe the site, page types, and core flows

Suggested shape:

```json
{
  "site_id": "bytetech",
  "root_url": "https://bytetech.info",
  "domains": ["bytetech.info", "bytedance.sg.larkoffice.com"],
  "site_type": "content",
  "page_types": [
    {
      "name": "article_detail",
      "url_patterns": ["/articles/"],
      "primary_content_signal": "article title + body iframe"
    }
  ],
  "entry_points": [
    {
      "name": "article",
      "url": "https://bytetech.info/articles/..."
    }
  ],
  "logged_out_signals": [
    "redirect to login page",
    "login button visible"
  ],
  "logged_in_signals": [
    "avatar visible",
    "main content iframe visible"
  ]
}
```

## `auth-strategy.json`

Purpose:

- Define how the site should acquire and verify authentication

Suggested shape:

```json
{
  "site_id": "bytetech",
  "mode": "hybrid",
  "login_entry_url": "https://bytetech.info/articles/...",
  "restore_priority": [
    "automation_session"
  ],
  "login_success_signals": [
    "avatar visible",
    "article iframe visible"
  ],
  "login_failure_signals": [
    "redirected to login domain",
    "login form visible"
  ],
  "notes": [
    "Do not attempt to import the user's personal browser profile"
  ]
}
```

Allowed `mode` values:

- `public`
- `interactive_login`
- `credential_login`
- `hybrid`

## `action-map.json`

Purpose:

- Record reusable site operations in semantic form

Suggested shape:

```json
{
  "site_id": "bytetech",
  "actions": [
    {
      "name": "open_article",
      "preconditions": [],
      "steps": [
        "navigate to article URL",
        "wait for title or main content iframe"
      ],
      "success_signals": [
        "article title visible"
      ]
    },
    {
      "name": "read_main_text",
      "preconditions": [
        "article detail page open"
      ],
      "steps": [
        "locate main content container",
        "extract visible text blocks in reading order"
      ],
      "success_signals": [
        "non-empty title and body text extracted"
      ]
    }
  ]
}
```

## `skill-spec.md`

Purpose:

- Convert structured artifacts into a human-readable site skill specification

Include:

- Scope
- Trigger conditions
- Supported user tasks
- Auth model
- Supported actions
- Failure and recovery rules
- Output directory for final generated skill

Keep `skill-spec.md` concise. It is a compiler input, not a project diary.
