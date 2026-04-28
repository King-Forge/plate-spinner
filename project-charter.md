# Project Charter

## Project Title
*(Working Title — TBD)*

---

## 1. Purpose

Develop a session-based, active incremental browser game centered on parallel task management under increasing pressure.

This project serves dual purposes:
- A **potential product**, built with real-world considerations such as robustness, persistence, and security
- A **portfolio artifact**, demonstrating full-stack engineering capability and system design

The project also explores whether an incremental game can be engaging without idle mechanics or long-duration passive progression.

---

## 2. Core Experience Goal

The game is designed around:
- Simple individual tasks
- Increasing number of simultaneous tasks
- Time pressure and cognitive load
- Eventual failure due to scaling difficulty

Difficulty emerges from coordination and multitasking rather than individual mechanic complexity.

---

## 3. Design Objectives

### 3.1 Intuitive, No-Tutorial Onboarding
- The game should be immediately playable with **no external or pre-game tutorial**
- New players should be able to begin playing instantly and achieve a meaningful first run
- Mechanics should be introduced **organically during gameplay**
- Optional contextual guidance (e.g., pause-on-first-encounter) may be used, but must remain unobtrusive and skippable

---

### 3.2 Active Gameplay (Non-Idle)
- Gameplay is fully manual and interactive
- No automation (e.g., auto-clickers) in core gameplay
- Player engagement is driven by multitasking and decision-making under pressure

---

### 3.3 Short, Discrete Sessions
- Gameplay is structured around individual runs/sessions
- Runs are self-contained and end in a failure state
- Sessions are designed to be replayable and progressively more challenging

---

### 3.4 Player-First Design
- Player experience takes priority over demonstration features
- Technical features should not degrade usability or gameplay clarity

---

## 4. MVP Definition (Offline Core)

The MVP is a **fully offline, single-session experience** where:

- A player can start and complete a run
- A run ends in a clear failure state
- The game provides clear feedback explaining why the run ended
- The experience is stable, responsive, and replayable

The MVP validates **gameplay and user experience**, not backend systems.

---

## 5. MVP Success Criteria

- Game can be played repeatedly without crashes
- No noticeable input lag or performance degradation during a session
- UI is clear and understandable without instruction
- Start and end conditions for a run are well-defined
- Difficulty scales to a natural failure point
- First-time players can successfully engage without prior knowledge

---

## 6. Scope (MVP)

### 6.1 In Scope
- Active incremental gameplay loop
- Session-based run structure
- Increasing multitasking complexity
- Pause functionality (no mid-run save)
- Fully offline operation

---

### 6.2 Out of Scope (MVP – Non-Negotiable)

- Multiplayer (all forms)
- Real-time networking during gameplay
- Always-online requirement
- Backend integration
- User accounts or authentication
- Leaderboards or competitive systems
- Mid-run save/resume
- Advanced anti-cheat systems
- Complex animation systems or high-fidelity graphics
- Full audio design (basic feedback sounds only)
- External integrations (OAuth, social, third-party APIs)
- Mobile/tablet-native versions
- Controller support
- Accessibility and localization features
- Analytics or telemetry systems
- Large-scale content balancing
- Modding or plugin systems
- User-generated content systems
- Monetization systems
- Save migration or version compatibility systems

---

## 7. Constraints

- Must function fully offline
- Must run in a browser without installation
- Development occurs alongside ongoing coursework
- Future backend will rely on a non-cloud personal server

---

## 8. Assumptions

- Run-level validation will be sufficient for backend integrity in later phases
- Client-side gameplay is acceptable given validation constraints
- Local storage is sufficient for temporary guest persistence
- Sessions are short enough to avoid requiring mid-run persistence
- Players will use standard keyboard and mouse input

---

## 9. Progression Model (Future Phases – High Level)

- Meta-progression through task-based achievements
- Upgrades that reduce pressure but do not automate gameplay
- Potential milestone-based progression modifiers or shortcuts
- Optional challenge modifiers for replayability

---

## 10. Risks

- Validation model complexity
- Scope creep
- Time constraints due to coursework
- Backend reliability (personal server)
- Difficulty balancing without analytics

---

## 11. Development Phases

- MVP (Offline Core)
- V0.5 (Persistence + Progression)
- V1.0 (Full Stack)
- V2.0 (Extended Features)

---

## 12. Explicit Statement

The MVP is intended to validate the **gameplay loop and player experience**.  
Backend systems, persistence, validation, and scalability will be introduced in later phases.
