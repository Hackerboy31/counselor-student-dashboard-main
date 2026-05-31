# Test Output

Captured from `npm test` at the repo root (runs the backend suite then the frontend
suite). CI runs the same command on every push/PR — see
[.github/workflows/ci.yml](../.github/workflows/ci.yml).

## Backend — Vitest + Supertest (28 tests)

```text
 RUN  v2.1.9 backend

 ✓ src/__tests__/derive.unit.test.ts (3 tests) 12ms
 ✓ src/__tests__/urgency.unit.test.ts (17 tests) 21ms
 ✓ src/__tests__/realtime.integration.test.ts (2 tests) 16ms
 ✓ src/__tests__/action-center.integration.test.ts (3 tests) 112ms
 ✓ src/__tests__/task-status.integration.test.ts (3 tests) 172ms

 Test Files  5 passed (5)
      Tests  28 passed (28)
```

Covers: urgency rubric (each signal + threshold boundaries), action-center
aggregation/sort/derivation on the seed (Maya = 75 critical, Carlos = 85 critical,
Jordan = 5 low), `PATCH` write-then-read with recomputed urgency, validation 400s,
404 envelopes with request ids, and the SSE broadcast on task change.

## Frontend — Vitest + React Testing Library + MSW (5 tests)

```text
 RUN  v2.1.9 frontend

 ✓ src/test/useActionCenterStream.test.tsx (1 test) 108ms
 ✓ src/test/ActionCenterPage.test.tsx (4 tests) 4532ms
   ✓ auto-selects the top student and renders summary, urgency, and overdue task first
   ✓ optimistically completes a task and confirms with a success toast
   ✓ rolls back and shows an error toast when the update fails
   ✓ reconciles the optimistic update with the matching SSE snapshot without reverting

 Test Files  2 passed (2)
      Tests  5 passed (5)
```

Covers: the happy-path render (profile, urgency badge, overdue-first task list), the
optimistic status update + success toast, optimistic rollback + error toast on a
failed request, the optimistic↔SSE reconciliation (no flicker when the authoritative
snapshot lands), and the SSE hook writing a pushed snapshot into the query cache.

## Manual end-to-end smoke (SSE)

Direct to the backend (`:4000`):

```text
stream status 200 text/event-stream
snapshot #1: tsk_002.status=in_progress urgency=75
snapshot #2: tsk_002.status=completed urgency=75
PASS: live SSE push received after PATCH
```

Through the Vite dev proxy (`:5173` → `:4000`), confirming the proxied stream is not
buffered:

```text
content-type: text/event-stream
snapshot events received via proxy: 2   (initial + post-PATCH push)
```
