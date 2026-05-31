# Counselor Student Action Center

A focused full-stack feature that lets a school counselor grasp a student's
situation in seconds: priorities and tasks, unread messages, and a single,
**explainable urgency level** — updating live as work changes.

> Built for the Zyra full-stack assessment. Task 1 (the feature) and Task 2
> (production hardening) are both included in this one repo.

To see it, run `npm install && npm run dev` and open http://localhost:5173 — the
console auto-selects the most urgent student on the counselor's caseload.

## Highlights

- **Explainable urgency** — a deterministic score with the exact signals that drove
  it (at-risk, overdue, urgent, unread, low GPA), not a black-box number.
- **Realtime via SSE** — change a task and the snapshot is pushed to every open view;
  no refresh, no polling.
- **Optimistic updates with zero flicker** — the client re-derives the snapshot with
  the *same* shared logic the server uses, so the optimistic state and the pushed
  snapshot are identical.
- **Senior-shaped backend** — layered (routes → controllers → services →
  repository), a Mongo-ready repository seam, Zod validation, request-id correlation,
  structured logging, and a central error envelope.
- **Tested & typed end-to-end** — 32 tests (Vitest/Supertest + RTL/MSW), strict
  TypeScript, ESLint, and CI.

## Tech stack

| Layer    | Choices                                                                          |
| -------- | -------------------------------------------------------------------------------- |
| Frontend | React + TypeScript + **Vite**, **TanStack Query** (server state), **Zustand** (UI state), **Tailwind**, **Radix UI** (shadcn-style), Vitest + RTL + MSW |
| Backend  | Node + **Express** + TypeScript, **Zod**, **pino**, Server-Sent Events, Vitest + Supertest |
| Shared   | `@csac/shared` — contract types + pure domain logic reused by both sides         |

The choice of stack and the reasons behind each decision are in
[ARCHITECTURE.md](./ARCHITECTURE.md).

## Quick start

**Prerequisites:** Node 20+ (`.nvmrc`) and npm 9+. No database or other external
service — the data is in-memory, so it's clone-and-run.

```bash
npm install        
npm run dev         
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` (and the SSE
stream) to the backend, so everything is same-origin in development.

### Scripts (run from the repo root)

| Script                     | What it does                                       |
| -------------------------- | -------------------------------------------------- |
| `npm run dev`              | Backend + frontend together (via `concurrently`)   |
| `npm run dev:backend`      | API only (`tsx watch`)                             |
| `npm run dev:frontend`     | Client only (Vite)                                 |
| `npm test`                 | Backend then frontend test suites                  |
| `npm run typecheck`        | `tsc --noEmit` across all workspaces               |
| `npm run lint`             | ESLint across backend + frontend                   |
| `npm run build --workspace @csac/frontend` | Production build of the client      |

### Environment (all optional)

| Var           | Default                  | Notes                                  |
| ------------- | ------------------------ | -------------------------------------- |
| `PORT`        | `4000`                   | Backend port                           |
| `CORS_ORIGIN` | `http://localhost:5173`  | Allowed browser origin                 |
| `LOG_PRETTY`  | `true` in dev            | Human logs vs. structured JSON         |
| `LOG_LEVEL`   | `info` (`silent` in test)| pino level                             |

## Project structure

```
shared/    @csac/shared — domain types, urgency engine, snapshot assembly (pure, no deps)
backend/   Express API: data (seed + repository), services, realtime (SSE), http (mw/controllers)
frontend/  React client: api, hooks, store (Zustand), components (ui + action-center + layout)
```

The full layout and the reasoning live in [ARCHITECTURE.md](./ARCHITECTURE.md); the
endpoints in [API-CONTRACT.md](./API-CONTRACT.md).

## Design

A dense, calm, information-first console rather than a marketing page. Neutral slate
palette, one teal accent, and **muted** urgency semantics (dusty oxblood / amber /
ochre / sage) so risk reads as clinical, not alarming. Tabular numbers for every
metric, separation by borders over shadows, and layout-matched skeletons so nothing
jumps on load. Rationale and the token set are in
[ARCHITECTURE.md](./ARCHITECTURE.md#design-language).

---

## Task 2 — Production hardening

### What was added

- **Request logging** — pino, structured by default and pretty in dev. Each line is
  tagged with the request id; access logs include method, path, status, and duration.
- **Error middleware with request IDs** — every request gets an `X-Request-Id`
  (reused from the caller if supplied). A central error handler renders one envelope
  shape and stamps the id into both the body and the response header, so a user-facing
  error maps to exactly one log line. The `ErrorState` UI even surfaces the id.
- **Integration tests** — Supertest against the real app: aggregation/urgency,
  `PATCH`-then-read with recomputed urgency, validation 400s, 404 envelopes, and the
  SSE broadcast. Plus pure unit tests for the urgency rubric.
- **Frontend tests** — RTL + MSW: render, optimistic update + rollback, and the SSE
  cache write.
- **CI** — [.github/workflows/ci.yml](./.github/workflows/ci.yml) runs typecheck →
  lint → test → build on every push/PR.

### Test evidence

32 tests pass (28 backend + 4 frontend). Full output:
[docs/TEST-OUTPUT.md](./docs/TEST-OUTPUT.md). CI re-runs the same `npm test` on every
push.

### Performance decisions & tradeoffs

- **SSE pushes a full snapshot, not a delta.** One status change shifts urgency,
  sort order, and several counts, so a delta would make the client re-derive anyway.
  Snapshots are idempotent and self-healing; the per-student payload is tiny. At
  higher event rates I'd switch to deltas + a version cursor.
- **`setQueryData` on push, not `invalidateQueries`.** The SSE frame already carries
  the authoritative state, so it's written straight into the cache — no redundant
  refetch, no loading flash. Invalidation is only a fallback when the stream drops.
- **Optimistic update reuses the server's derivation.** The client runs the same
  `assembleActionCenter` as the backend, so the optimistic snapshot equals the pushed
  one — instant feedback with no reconciliation flicker. The tradeoff is a little
  shared code, which is exactly why the derivation lives in `@csac/shared`.
- **In-memory repository behind an interface.** Zero-setup to run and review; the
  same interface accepts a `MongoRepository` later without touching services.
- **Timezone-stable overdue.** Date-only `dueDate` is compared as a UTC calendar-date
  string to avoid an off-by-one that would otherwise depend on server locale.
- **Deterministic time via an injected clock** — also what keeps the tests stable.

Server state lives only in the React Query cache (never duplicated into Zustand),
which avoids a second cache drifting out of sync — a correctness *and* performance win
(no double renders, no manual syncing).

## Testing

```bash
npm test                       
npm run test:backend           
npm run test:frontend          
```

## Known limitations / next steps

Auth and per-counselor scoping, real persistence (Mongo seam is ready), optimistic
concurrency on `PATCH`, caseload pagination, marking messages read, and SSE deltas for
higher-frequency streams.
