# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static marketing website for **Metro Parlez-Ment**, a Nigeria-based charity/NGO
(impact work centered around Port Harcourt — medical outreach, schools,
orphanages, correction centers). It is a set of hand-written HTML pages with no
build step, no framework, and no dependencies.

## Running the site

There is no build, lint, or test tooling. Open a page directly in a browser, or
serve the folder statically so relative `Asset/` paths and inter-page links
resolve correctly:

```bash
python -m http.server 8000    # then open http://localhost:8000/index.html
```

## Architecture

The site is **6 standalone, self-contained pages** — there are no shared
partials, stylesheets, or script files. Each `.html` file inlines its own
`<style>` block and its own `<script>` block:

- `index.html` — home (largest page; the canonical source for the shared nav/footer/JS patterns)
- `about.html`, `impact.html`, `get-involved.html`, `donate.html`, `contact.html`

All images live in `Asset/` (subfolders: `About-us-image/`, `Gallery/`, `Icon/`,
`Impact medical/`, `impact orphanage/`, `impact school/`, `impact others/`).

### Key consequence: shared markup is duplicated, not imported

The navbar, mobile drawer, footer, the `:root` CSS design tokens, and the
navigation/drawer JavaScript are **copy-pasted into every page**. When changing
any of these, apply the edit to **all six files** or they will drift.

- **Design tokens** live in the `:root` block at the top of each page's
  `<style>` (e.g. `--red: #ed3237`, `--footer-bg: #7b1818`, `--bg-light`,
  `--radius`). Reuse these variables rather than hard-coding colors.
- **Navigation** exists twice per page: the desktop `.nav-links` list and a
  `.nav-drawer` (mobile). Both must be kept in sync. The current page's link
  carries `class="active"`.
- **Shared JS** (see bottom of `index.html`): smooth-scroll for `#` anchors,
  scroll-based active-nav highlighting, and the hamburger/drawer open/close
  (`#hamburger`, `#navDrawer`, `#navOverlay`, `#drawerClose`, Escape to close).

Font is Google Fonts **Inter**, loaded via `<link>` in each `<head>`.
