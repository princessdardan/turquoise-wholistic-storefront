# Ralph — Autonomous Agent Loop for Turquoise Wholistic Storefront

## Overview

Ralph is an autonomous AI agent loop that iteratively completes user stories from a PRD. Each iteration spawns a fresh AI instance (Amp or Claude Code) with clean context. Memory persists across iterations via `progress.txt`, `prd.json`, and git history.

## How It Works

1. `ralph.sh` reads `prd.json` and spawns a fresh AI instance
2. The AI reads `CLAUDE.md` (its instructions), `prd.json` (the work), and `progress.txt` (accumulated knowledge)
3. It picks the highest-priority incomplete story, implements it, typechecks, commits, and updates the PRD
4. The loop repeats until all stories pass or max iterations are reached
5. Previous runs are auto-archived to `archive/` when the PRD branch changes

## Commands

```bash
# Run with Amp (default)
./scripts/ralph/ralph.sh [max_iterations]

# Run with Claude Code
./scripts/ralph/ralph.sh --tool claude [max_iterations]

# Default: 10 iterations max
```

## Key Files

| File | Purpose |
|---|---|
| `ralph.sh` | Bash loop that spawns AI instances, handles retries and archiving |
| `CLAUDE.md` | Instructions given to each AI instance — project context, commands, workflow |
| `prd.json` | Current PRD with user stories, priorities, and pass/fail status |
| `progress.txt` | Accumulated progress log with Codebase Patterns section at top |
| `.last-branch` | Tracks the previous PRD branch for auto-archiving |
| `archive/` | Archived PRDs and progress logs from completed runs |

## Creating a New PRD

Edit `prd.json` with this structure:

```json
{
  "project": "Turquoise Wholistic Storefront",
  "branchName": "ralph/feature-name",
  "description": "Brief description of the feature batch",
  "userStories": [
    {
      "id": "US-001",
      "title": "Short title",
      "description": "As a [role], I want [goal] so that [benefit].",
      "acceptanceCriteria": [
        "Specific, testable criterion",
        "Typecheck passes"
      ],
      "priority": 1,
      "passes": false,
      "notes": "Additional context. File path hints."
    }
  ]
}
```

**Tips for writing effective stories:**
- Keep stories small enough to complete in one AI context window (~30 min of work)
- Include "Typecheck passes" in every story's acceptance criteria
- Order priorities so dependencies come first (e.g., shared component before pages that use it)
- Include file path hints in `notes` when you know where changes should go
- If a story requires backend API changes, note it — Ralph will skip it and log the dependency
- For UI stories, describe the expected visual result and reference existing components/patterns

## Single-Repo Scope

Unlike the backend ralph instance (which is dual-repo aware), this storefront ralph operates **exclusively on this repo**. Stories requiring backend changes (new API routes, modules, etc.) should be handled by the backend ralph or manually.

| Repo | Path | Purpose |
|---|---|---|
| Storefront (Next.js 15) | `.` (this repo) | Customer-facing pages, components, styles, data fetching |
| Backend (Medusa v2) | `../turquoise-wholistic` | API routes, modules, workflows (read-only reference) |

## Architecture Reference

### Storefront Patterns
- **App Router:** `src/app/[countryCode]/` with `(main)` and `(checkout)` route groups.
- **Components:** Server components by default. Interactive parts extracted as `"use client"` components.
- **Data fetching:** Server actions in `src/lib/data/` call the Medusa API.
- **Styling:** Tailwind CSS with turquoise (#40E0D0) primary, sand neutral (#F5F0EB), gold accent (#D4A853).
- **Product cards:** `ProductPreview` (server) + `QuickAddButton` (client) pattern.
- **Navigation:** `LocalizedClientLink` auto-prepends country code to all links.
- **State management:** React contexts for toast, wishlist, channel selection, dual-cart, modals.
- **Auth:** JWT in httpOnly cookie, parallel routes for account (`@dashboard`/`@login`).
- **Channel system:** Retail vs professional channel with separate publishable API keys and carts.

### Backend API (Read-Only Reference)
- **Store routes:** `/store/blog`, `/store/gift-cards`, `/store/products/[id]/metadata`, `/store/subscriptions`, `/store/settings`, `/store/cta`
- **Custom modules:** `product-metadata`, `blog`, `subscription`, `gift-card`, `wishlist`, `product-review`, `cta`
- **Auth routes:** `/auth/*` for customer authentication

## Operational Notes

- **Auto-archiving:** When `prd.json`'s `branchName` changes, the previous PRD and progress are copied to `archive/YYYY-MM-DD-branch-name/`
- **Retry logic:** API errors (500, 429, rate limits) trigger up to 3 retries with exponential backoff
- **Completion signal:** The AI outputs `<promise>COMPLETE</promise>` when all stories pass
- **Known typecheck errors:** Storefront has pre-existing errors in shipping, line-item-price, and country-select components. These are expected — don't try to fix them.
- **Package manager:** This project uses Yarn 4 (`yarn@4.12.0`). Always use `yarn` instead of `npm`.
