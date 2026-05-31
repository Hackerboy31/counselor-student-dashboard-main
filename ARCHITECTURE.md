# Architecture

A small but production-shaped full-stack feature: a counselor's **Student Action
Center**. The guiding principle is a **single source of truth for derived data** —
urgency, overdue, sort order, and stats are computed by one set of pure functions
that *both* the server and the client reuse.

## Monorepo (npm workspaces)

```
shared/    @csac/shared    types + pure domain logic (no runtime deps)
backend/   @csac/backend   Express + TypeScript API
frontend/  @csac/frontend  React + Vite client
```

One `npm install` at the root bootstraps all three. **Why workspaces over two
separate repos/packages:** the API contract types and the derivation logic live in
`shared/` and are imported by both sides, so the wire format is enforced at compile
time and the client's optimistic update can't drift from the server's math. **Why not
Turborepo/Nx:** unnecessary tooling for three packages — npm workspaces ship with
Node and add no config to learn.

`shared/` is intentionally runtime-dependency-free and ships as `.ts` consumed
directly (backend via `tsx`, frontend via a Vite alias), so there's no build step in
dev.

## Backend

### Layered, one-directional dependencies

```
HTTP (routes → controllers → middleware)
        │  depends on
services (ActionCenterService, TaskService)
        │  depends on
data (Repositories interface) + domain logic (@csac/shared) + lib (clock, logger)
```

- **Controllers are thin**: validate (via middleware) → call a service → shape the
  HTTP response. No business logic; no Express objects leak into services.
- **`createApp(deps)`** builds the Express app without binding a port, so Supertest
  drives the real app. **`container.ts`** is the composition root that wires repos,
  clock, services, the event bus, and the SSE hub, and is where overrides (a fixed
  clock, a stub repo) are injected for tests.

### Repository pattern (the MongoDB seam)

The app depends only on `StudentRepository` / `TaskRepository` / `MessageRepository`
interfaces ([backend/src/data/repository.ts](./backend/src/data/repository.ts)). The
in-memory implementation deep-clones the seed on construction and hands back clones
on every read/write, so state is isolated per instance (a fresh dataset per test) and
the store can never be mutated by reference.

Swapping to MongoDB means writing one `MongoRepository` that implements the same
three interfaces — services, controllers, and the urgency engine are untouched.

### Urgency engine

`computeUrgency` ([shared/src/urgency.ts](./shared/src/urgency.ts)) is a pure,
deterministic, **explainable** function: it returns a level, a numeric score, and the
ordered list of signals that fired (each with its own weight), so the UI shows
exactly *why* a student is urgent rather than a black-box number.

| Signal               | Condition                         | Weight                 |
| -------------------- | --------------------------------- | ---------------------- |
| `AT_RISK_ENROLLMENT` | `enrollmentStatus === "at_risk"`  | +30                    |
| `OVERDUE_TASKS`      | per overdue **open** task         | +15 each, cap +45      |
| `URGENT_TASKS`       | per urgent-priority **open** task | +10 each, cap +30      |
| `UNREAD_MESSAGES`    | per unread message                | +5 each, cap +15       |
| `LOW_GPA`            | `gpa < 2.5` / `2.5 ≤ gpa < 3.0`   | +20 / +10              |

Score is clamped to 100. Levels: **critical ≥ 70**, **high 45–69**, **moderate
20–44**, **low < 20**. Against the seed (today = 2026-05-31): **Maya 75 (critical)**,
**Carlos 85 (critical)**, **Jordan 5 (low)** — a wide spread that shows the function
discriminates.

### Task sorting & `isOverdue`

`assembleActionCenter` ([shared/src/derive.ts](./shared/src/derive.ts)) joins the
entities and produces the snapshot. Tasks are sorted for triage:
open-before-completed → overdue first → priority weight (urgent>high>medium>low) →
due date ascending → id (stable tiebreak). Completed tasks sink to the bottom,
most-recently-updated first.

`isOverdue = status !== "completed" && dueDate < today`, where both sides are
compared as **UTC calendar dates** (`YYYY-MM-DD` string compare). This deliberately
avoids the classic timezone off-by-one where a date-only due date flips depending on
the server's local zone.

### Cross-cutting middleware

Order: `cors → requestId → requestLogger → json → routes → notFound → errorHandler`.

- **Request id** — reuses an inbound `X-Request-Id` or generates a UUID, sets the
  response header, and attaches a pino **child logger bound to the id**. This single
  mechanism feeds the id into every access log, every error log, and every error body.
- **Logging** — pino (structured JSON; pretty in dev via `LOG_PRETTY`). One library,
  near-zero overhead, not hand-rolled.
- **Error handling** — a central handler maps `AppError`s to their status/code/details
  and the standard envelope; anything else is logged with its stack and returned as a
  generic 500 (internals never leak). `asyncHandler` forwards both sync throws and
  rejected promises into this handler.
- **Validation** — Zod schemas drive a `validate(schema, source)` middleware; a
  compile-time assertion keeps the Zod status enum in lockstep with the shared union.

### Realtime (SSE)

```
PATCH status → TaskService.updateStatus → bus.emit("taskChanged", {studentId})
                                                    │
            container bridge subscriber ────────────┘
                  recompute snapshot → SseHub.broadcast(studentId, snapshot)
```

The mutation path stays transport-agnostic — it emits a domain event; the realtime
layer owns delivery. The `SseHub` tracks connections per student, sends an initial
snapshot on connect, heartbeats every 15s, cleans up on disconnect, and caps
concurrent streams per student (evicting the oldest) so reconnect storms can't grow
connections unbounded.

**Full snapshot, not deltas:** one status change shifts the urgency score, sort order,
and several counts, so a delta would force the client to re-derive everything anyway.
Snapshots are idempotent and self-healing (a missed/duplicated event can't desync the
client), and the per-student payload is tiny. For a higher-frequency stream you'd
switch to deltas + a version/ETag — noted as future work.

## Frontend

### State split (the load-bearing decision)

- **TanStack Query owns all server state** — the action-center query, the roster
  query, and the task-status mutation. SSE writes directly into this cache.
- **Zustand owns only ephemeral UI state** — selected student, status filter, stream
  status, and the toast queue. Server data is **never** copied into Zustand; the task
  list is filtered at render time. This keeps one source of truth and avoids the
  classic "two caches drift apart" bug.

A central **query-key factory** is used identically by the query, the mutation, and
the SSE hook, so cache writes always hit the right entry.

### Optimistic updates that don't fight SSE

`useUpdateTaskStatus` re-runs the **shared** `assembleActionCenter` in `onMutate`, so
the optimistic cache entry has the exact counts/sort/urgency the server will return.
When the authoritative SSE snapshot lands it's byte-for-byte equivalent → **no
flicker**. `onSettled` skips refetching while the stream is `live` (the push already
reconciles) and only invalidates as a fallback when the stream is down. On error it
rolls back to the pre-mutation snapshot and toasts.

This dual-path — optimistic for the actor's instant feedback, SSE for cross-client
live updates — is the realtime story the feature is built around.

### Design language

A dense, calm, information-first console (Linear/Vercel register, not a marketing
page): neutral slate palette, a single teal accent, and deliberately **muted** urgency
semantics (dusty oxblood / amber / ochre / sage instead of primary red/green/yellow).
Separation by borders over shadows; tabular numbers for all metrics; layout-matched
skeletons so content doesn't jump. See the README for the full token set.

## Testing

Determinism comes from the **injected clock** — tests build the app/snapshots with a
`FixedClock("2026-05-31T12:00:00Z")`, so overdue and urgency assertions never rot.

- **Backend** (Vitest + Supertest, fresh in-memory repo per test): urgency rubric +
  boundaries, seed aggregation, `PATCH`-then-read with recomputed urgency, validation
  400s, 404 envelopes, and the SSE broadcast.
- **Frontend** (Vitest + RTL + MSW): happy-path render, optimistic update + rollback,
  and the SSE hook writing into the cache. `EventSource` (absent in jsdom) is stubbed.

## Known limitations / next steps

Auth & per-counselor scoping; real persistence (the Mongo seam is ready); optimistic
concurrency on `PATCH` via `updatedAt`; pagination for large caseloads; marking
messages read; SSE deltas + reconnection cursor for higher-frequency streams.
