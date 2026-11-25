<!-- BEGIN:nextjs-agent-rules -->

# Agent rules

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## shadcn/ui & `@shadcn/lint` Policy

- **Prefer native shadcn/ui components** whenever possible instead of building custom UI primitives.
- **Always use the `/shadcn` skill and the `shadcn` MCP server** when discovering, inspecting, or adding components.

### Workflow for Adding a shadcn/ui Component

1. **Install via CLI**: Add the component using the `shadcn` CLI (e.g., `npx shadcn@latest add <component>`).
2. **Add `@shadcn/lint` contracts in `eslint.config.mjs`**:
   - Add one `shadcn/no-restyle` contract per exported component/subcomponent (shadcn files commonly export multiple component functions; each must have its own contract entry).
   - Keep `contracts` sorted alphabetically by component name (`pattern`).
   - Apply the strictest contract that is not counterproductive. Default baseline:

     ```js
     {
       pattern: "^ComponentName$",
       allow: ["layout"],
       deny: ["h", "min-h", "max-h", "size"],
     }
     ```

   - Read the component's documentation to check whether it legitimately accepts additional utility classes/categories (e.g., `border`, `spacing`, `typography`) before finalizing its contract.
   - **Explicit approval required for exceptions**: Do not add exceptions without explicit user authorization.
3. **Lint & format**: Run `npm run lint` and `npm run format` until there are **0 warnings and 0 errors**.
