# Haply Shape Sandbox — Take-Home Submission

3D shape sandbox built with React Three Fiber and Socket.IO.
Multiple users can create, select, move, and rotate shapes in a
shared 3D space, with changes synced live across browser tabs — modeling the
positional/rotational data stream and collision-based force feedback
described in the challenge brief.

## Tech stack

- **Client:** React, TypeScript, Vite, React Three Fiber, drei
  (`TransformControls`, `OrbitControls`, `Grid`), Socket.IO client
- **Server:** Node.js, Express, Socket.IO

## Project structure

```
/
├── client/     # React + Vite frontend
├── server/     # Express + Socket.IO backend
└── README.md
```

## Running it locally

```bash
# Terminal 1 — server
cd server
npm install
npm run dev

# Terminal 2 — client
cd client
npm install
npm run dev
```

Open the client URL (typically `http://localhost:5173`) in two browser tabs
to see real-time sync in action.

## Controls

- **Click** a shape to select it (acquires a lock — other users can't move it
  while you have it selected)
- **Click and drag** to move the selected shape
- **`G`** — switch to move (translate) mode
- **`R`** — switch to rotate mode
- **Click empty space** to deselect (releases the lock)

## What's implemented

- Create shapes (cube / sphere) from the toolbar
- Select, move, and rotate shapes with `TransformControls`
- Live position and rotation sync across all connected clients over
  WebSockets, not just on release
- Per-shape ownership/locking so two users can't fight over the same shape —
  a shape already held by another user is dimmed and un-selectable until
  released
- Locks are automatically released if a user deselects or disconnects
  (e.g. closes the tab mid-drag)
- Basic collision detection between shapes, with a visual flash and a
  force-feedback event sent to the server as a stand-in for a real haptic
  device (see below)
- Hover affordance (cursor + highlight) signaling a shape is grabbable

## What's simplified

- **Collision detection** uses a bounding-sphere approximation per shape
  type rather than precise mesh-accurate collision (e.g. a cube's actual box
  footprint isn't modeled exactly) — a reasonable simplification given the
  time box, since exact collision geometry wasn't the focus of the exercise.
- **Haptic force feedback** is simulated rather than sent to real hardware,
  since no haptic device was available to test against. On collision, the
  client flashes both shapes red, calls `navigator.vibrate()` where
  supported, and the server logs the received `{x, y, z}` force vector to
  its console — standing in for the "endpoint you can send force feedback
  to" described in the brief.
- The currently-dragged shape does not flash on collision (only the shape it
  hits does). This was a deliberate tradeoff to avoid re-introducing a bug
  where `TransformControls` would detach mid-drag on unrelated re-renders —
  documented further below.

## What's not attempted

- Shape deletion
- Persistent storage (shapes live in memory on the server and reset on
  restart)
- Precise/mesh-accurate collision response (shapes don't physically push
  each other apart)

## Notable bugs found and fixed along the way

Development was incremental, committing after each working feature (see
commit history). A few bugs surfaced during that process that are worth
calling out, since they reflect real debugging rather than being designed
around from the start:

- **Shape jumps back after a drag ends.** `TransformControls`, when given
  `children`, attaches its gizmo to an internal wrapper `<group>` — not
  directly to the mesh inside it. Reading the object's position off that
  group after a drag, without accounting for this, meant the mesh's own
  position was being applied twice (or the read position was relative to
  the wrong node), producing a snap-back on release. Fixed by having the
  wrapper group own the real position/rotation (via props on
  `TransformControls` itself) and rendering the inner mesh at the identity
  transform, so there's a single source of truth.
- **Dragging stops working after any unrelated re-render** (e.g. a
  collision flash happening elsewhere in the scene). `TransformControls`
  watches its `children` prop by reference and detaches/reattaches the
  gizmo whenever that reference changes — which happens on every React
  re-render by default, since JSX creates a new element each time. Fixed by
  memoizing the selected shape's mesh element so it's only recreated when
  the selection itself changes, not on unrelated state updates.
- **Shape appears to reset on deselect.** The move handler only emitted the
  new position to the server and wasn't updating local state directly,
  relying on the server's echoed broadcast to update it. Since deselection
  happened faster than that round trip, the shape would briefly render at
  its stale, pre-drag position. Fixed with an optimistic local state update
  alongside the socket emit.

## LLM usage disclosure

I had assistance of an LLM (ChatGPT), during development and documentation.
The full chat transcript is attached / linked here:
**[add link or attached file]**.
- https://chatgpt.com/share/6a60404a-e0f0-83ea-ade2-a0199ae0caf8

- https://r3f.docs.pmnd.rs/api/events

- https://drei.docs.pmnd.rs/gizmos/transform-controls

- https://threejs.org/docs/#Object3D

- https://socket.io/docs/v4/emitting-events/
