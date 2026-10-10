# AGENTS.md

Agentic QA experiment sandbox. Treat work here as disposable experiments — don't add
deploy infra, Docker, or CI ceremony unless explicitly asked.

## Current state (verified 2026-10-04)

Empty scaffold: `git init` only, zero commits, no remote, nothing tracked.

- The only file is `package.json`, and it is untracked. No README, source, tests,
  lockfile, `.gitignore`, lint/format/typecheck config, or CI exists.
- `git log` and `git diff` are therefore empty. There is no baseline to diff against;
  a file absent from `git status` was never committed, not deleted.
- Language and framework beyond npm are **undecided**. Don't assume TypeScript, ESM, or
  any particular agent/LLM framework — ask before scaffolding one.

## Commands

- `npm install` — the only setup step. It creates the first lockfile; commit it.
- `npm test` — **always fails, by design.** `scripts.test` is still the npm placeholder
  (`echo "Error: no test specified" && exit 1`). A failure here is not a regression.

No lint, typecheck, build, or format command exists yet. Add one to `package.json`
scripts when the tooling is actually introduced rather than documenting a guess.

## Gotchas in `package.json`

- `"type": "commonjs"` — `.js` files are CommonJS. Moving to ESM or TypeScript means
  changing or removing this field.
- `"main": "index.js"` points to a file that doesn't exist, so the package isn't
  importable or publishable as-is.
- `description` and `keywords` are empty, and `license: ISC` is npm's default rather
  than a deliberate choice.
