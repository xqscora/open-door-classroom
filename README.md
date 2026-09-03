# Open Door Classroom

Open Door Classroom is a student-built, local-first prototype for GatewayHacks 2026's Equity in Education track. Students send one anonymous lesson signal; a teacher sees only aggregate patterns and a concrete next classroom adjustment.

## Why it is distinct

This is classroom coordination, not a personal energy check-in, a diagnosis, a personality system, or a task planner. The core object is a lesson-level access signal and a teacher response queue.

## Run locally

```text
node serve.cjs
```

Open `http://127.0.0.1:8789/`. Use the student view to send a signal, then open the teacher board. `Load sample room` inserts synthetic signals for a repeatable demo; all data stays in browser localStorage.

## Boundary

The prototype stores no names, email addresses, exact timestamps, or external data. It does not infer a student's identity or diagnose learning difficulty.

## GatewayHacks fit

- Track: Equity in Education
- Live requirement checked: ages 13+, students only, public project page, visual, and video pitch
- Public repository and demo are optional on the event page but included here for reproducibility
- No external submission or Discord action is claimed by this repository
