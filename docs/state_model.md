# State Model

## States

- StartScreen
- Running
- Paused
- Failed
- ViewingProjectDetails
- SettingsOpen

---

## Transitions

StartScreen → Running (Start button)

Running → Paused (Pause input)
Paused → Running (Resume input) (resume run with current state)
Paused → Running (Restart input) (clear state and initialize new run)

Running → Failed (Failure condition met)
Failed → Running (Restart)
Failed → StartScreen (Return to Start)

StartScreen → ViewingProjectDetails (Project Details button)
Paused → ViewingProjectDetails (Project Details button)
Failed → ViewingProjectDetails (Project Details button)
ViewingProjectDetails → <previous view> (Return button)

StartScreen → SettingsOpen (Settings button)
Paused → SettingsOpen (Settings button)
Failed → SettingsOpen (Settings button)
SettingsOpen → <previous view> (Return button)

---

## Rules / Constraints

- Cannot pause unless Running
- Can only view Project Details and Settings when not running
- Project Details and Settings can only return to last screen
- Failure overrides Running immediately
- Gameplay freezes immediately for any state other than Running
