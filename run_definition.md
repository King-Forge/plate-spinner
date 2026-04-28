# Run Definition & Persistence Rules

## 1. Run Definition

### 1.1 Run Start

A run begins when the player initiates gameplay and is presented with a **single initial task**.

- The initial task must be performed successfully a number of times to trigger progression
- Failure at this stage is possible, but intentionally difficult

---

### 1.2 Core Run Loop

The game loop consists of:

- Repeated execution of one or more concurrent tasks
- Increasing complexity through the addition of new tasks over time
- Continuous player input required to maintain all active tasks

Progression is **automatic**, not player-driven:
- After a defined number of successful iterations, new tasks are introduced
- The gameplay scope expands to include additional concurrent responsibilities

---

### 1.3 Task Performance States

Each task can exist in one of three performance ranges:

- **Failure State**
  - Task not completed successfully within required constraints

- **Acceptable State**
  - Task completed successfully within expected parameters

- **Perfect State**
  - Task completed at a high-performance threshold
  - May contribute to accelerated progression or scoring (future phases)

---

### 1.4 Progression Model (Within a Run)

- Tasks are added automatically based on successful execution
- The player does not manually choose upgrades or scaling paths
- Complexity increases as the number of concurrent tasks grows
- Achieving “perfect” performance may accelerate the rate of increasing complexity (future behavior)

For MVP:
- Progression is entirely **skill-based**
- No persistent upgrades or meta-progression exist

---

### 1.5 Run End Conditions

A run ends in a **failure state** when one or more of the following conditions are met:

- A threshold of total task failures is reached
- Multiple tasks fail concurrently
- A single task fails repeatedly within a defined window

Exact thresholds will be determined during balancing.

---

### 1.6 Run End Feedback

At the end of a run:

- The player is clearly informed that the run has ended
- The reason for failure is communicated

---

## 2. Persistence Rules (MVP)

### 2.1 Run Persistence

- No run data is persisted in MVP
- All run data is discarded upon completion or exit

---

### 2.2 Player Progression Persistence

- No player progression, achievements, or upgrades are stored
- Each run is independent and stateless

---

### 2.3 Local Storage Usage

- Local storage may be used for temporary or session-scoped data if required
- No guarantees are made regarding persistence across sessions
- Local storage is not considered authoritative

---

### 2.4 Offline Behavior

- The game is fully functional without backend connectivity
- All gameplay logic executes client-side
- No attempt is made to sync or upload data

---

## 3. Future Persistence Considerations

The following may be implemented in later phases:

- Run result storage
- Player statistics tracking
- Meta-progression systems (achievements, upgrades)
- Cross-session persistence (local and/or backend)
- Run validation prior to persistence
- Leaderboards and scoring systems
- Optional offline run caching and later validation

---

## 4. Explicit Statement

In the MVP, the game is entirely self-contained.  
Runs are transient, and no player data persists beyond the current session.  
The purpose of this phase is to validate gameplay, not progression systems.
