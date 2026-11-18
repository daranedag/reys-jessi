# AGENTS.md

## Neon backend

- Project: `reys-jessi`, production branch: `production`, database: `neondb`.
- The app uses Neon Postgres from server-only modules and Neon Auth for admin sessions.
- Keep application database objects under the `reys_` prefix. Review the Neon skills before changing database provisioning or authentication.
- Store credentials in ignored local environment files or private Vercel variables.
- Restore and role SQL are documented in [migrations/README.md](migrations/README.md).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
