# API Contract

Base URL: `/api` · All bodies are JSON · Timestamps are ISO-8601 (UTC) · Dates are `YYYY-MM-DD`.

Every response carries an `X-Request-Id` header. For errors, the same id appears in
the body so a user-visible failure can be traced to a single log line.

## Conventions

### Error envelope

All non-2xx responses share one shape:

```jsonc
{
  "error": {
    "code": "STUDENT_NOT_FOUND",     
    "message": "No student with id 'stu_999'.",
    "requestId": "a71bae16-…",       
    "details":
  }
}
```

| Code               | HTTP | Meaning                                   |
| ------------------ | ---- | ----------------------------------------- |
| `VALIDATION_ERROR` | 400  | Request body/params failed schema checks  |
| `STUDENT_NOT_FOUND`| 404  | No student with the given id              |
| `TASK_NOT_FOUND`   | 404  | No task with the given id                 |
| `NOT_FOUND`        | 404  | Unmatched route                           |
| `INTERNAL_ERROR`   | 500  | Unexpected error (details never leaked)   |

---

## `GET /api/health`

Liveness probe.

**200**
```json
{ "status": "ok", "uptimeSec": 17, "timestamp": "2026-05-31T18:23:06.892Z" }
```

---

## `GET /api/students?counselorId={id}`

Roster for a counselor's caseload, each row carrying a derived urgency level for
at-a-glance triage. Sorted by urgency score descending. `counselorId` defaults to
`csl_001` (the only counselor in the seed).

**200**
```json
{
  "students": [
    {
      "id": "stu_003",
      "name": "Carlos Rivera",
      "grade": 10,
      "enrollmentStatus": "at_risk",
      "urgency": { "level": "critical", "score": 85 },
      "openTaskCount": 3,
      "unreadMessageCount": 2
    }
  ]
}
```

---

## `GET /api/students/:id/action-center`

The full action-center snapshot: profile, derived urgency (with explainable
signals), summary stats, the task list (sorted for triage, each with `isOverdue`),
and messages (newest first).

**200** (abridged)
```jsonc
{
  "student": {
    "id": "stu_001", "name": "Maya Patel", "email": "maya.patel@school.edu",
    "grade": 11, "gpa": 3.2, "counselorId": "csl_001", "enrollmentStatus": "at_risk"
  },
  "urgency": {
    "level": "critical",          
    "score": 75,                  
    "signals": [
      { "code": "AT_RISK_ENROLLMENT", "label": "Flagged at-risk", "detail": "…", "weight": 30 },
      { "code": "OVERDUE_TASKS",      "label": "1 overdue task",  "detail": "…", "weight": 15 },
      { "code": "URGENT_TASKS",       "label": "2 urgent tasks open", "detail": "…", "weight": 20 },
      { "code": "UNREAD_MESSAGES",    "label": "2 unread messages",   "detail": "…", "weight": 10 }
    ]
  },
  "stats": {
    "totalTaskCount": 5, "openTaskCount": 4, "completedTaskCount": 1,
    "overdueTaskCount": 1, "urgentOpenTaskCount": 2,
    "totalMessageCount": 3, "unreadMessageCount": 2
  },
  "tasks": [
    {
      "id": "tsk_003", "studentId": "stu_001", "title": "Attendance improvement plan",
      "description": "…", "status": "todo", "priority": "urgent",
      "dueDate": "2026-05-28", "createdAt": "…", "updatedAt": "…",
      "isOverdue": true
    }
  ],
  "messages": [
    {
      "id": "msg_001", "studentId": "stu_001", "from": "Mrs. Thompson (Math)",
      "subject": "Maya missing assignments", "preview": "…",
      "read": false, "receivedAt": "2026-05-30T08:30:00Z"
    }
  ],
  "generatedAt": "2026-05-31T18:23:06.000Z"
}
```

**404** — `STUDENT_NOT_FOUND` if the id is unknown.

> The urgency rubric (weights, caps, thresholds) is documented in
> [ARCHITECTURE.md](./ARCHITECTURE.md#urgency-engine).

---

## `PATCH /api/tasks/:taskId/status`

Updates a task's status and stamps `updatedAt`. **Side effect:** broadcasts a
refreshed action-center snapshot to that student's SSE subscribers.

**Request**
```json
{ "status": "in_progress" }   
```

**200**
```json
{
  "task": {
    "id": "tsk_002", "studentId": "stu_001", "title": "Meet with math tutor",
    "description": "…", "status": "in_progress", "priority": "high",
    "dueDate": "2026-06-01", "createdAt": "…", "updatedAt": "2026-05-31T18:23:10.000Z"
  }
}
```

**400** — `VALIDATION_ERROR` (with `details` from Zod) for a missing/invalid status.
**404** — `TASK_NOT_FOUND` for an unknown task id.

---

## `GET /api/students/:id/action-center/stream` (SSE)

Server-Sent Events stream of action-center snapshots for one student. Validated like
the REST read — a **404 JSON envelope** is returned for an unknown student *before*
the stream is established.

Headers: `Content-Type: text/event-stream`, `Cache-Control: no-cache, no-transform`,
`Connection: keep-alive`.

- On connect, the server immediately sends one `snapshot` event (self-healing: a late
  subscriber gets current state without a separate fetch).
- On any task-status change for that student, a fresh `snapshot` is pushed.
- A `: heartbeat` comment is sent every 15s to keep the connection alive.
- `retry: 3000` hints the browser's reconnect backoff.

**Event frame**
```text
id: 1
event: snapshot
data: {"student":{…},"urgency":{…},"stats":{…},"tasks":[…],"messages":[…],"generatedAt":"…"}
```

`data` is exactly the `GET …/action-center` payload, so the client handles a single
shape on both the REST and realtime paths.

**Try it**
```bash
curl -N http://localhost:4000/api/students/stu_001/action-center/stream
curl -X PATCH http://localhost:4000/api/tasks/tsk_002/status \
  -H 'Content-Type: application/json' -d '{"status":"completed"}'
```
