# Test Strategy

## 1. Purpose

- Plan for how the game will be tested, both for stability and for fun.

## 2. Automated Unit Tests

- Task input - valid and invalid values
- Task progression - plausible and edge-case delta-t
- Task Evaluation
  - all valid and a set of invalid status values
  - Task correctly returns state on update past iteration boundary
- Progression rules
- Failure criteria
- Dependency logic

## 3. Integration Tests

- Engine loads static level data
- Task loads static task data
- Engine loads localStorage
- Engine gracefully handles invalid/missing/corrupt localStorage
- Input correctly changes task state - all different performance windows
- Engine correctly handles task iteration results

## 4. Manual Playtesting

- All new mechanics are introduced organically, with time to learn before they become more intense
- Expected inputs and timing are communicated visually/intuitively with no explicit instructions needed
- Game state is readable and can be understood for all presented task sets
- Game feels challenging without being frustrating
- Game feels stressful without feeling unfair
- Most users cannot reach the end of the MVP level-set on first playthrough
- Most users want more content when they reach the end of the MVP level-set

## 5. Performance Checks

- Game can be played for a longer session without ramping resource requirements or instability (no memory leaks or messy/missing cleanup)
- Game can be idle for a long period without degradation
- Game can be paused for a long period without degradation
- No noticeable slowdown or frame drops at any point
- No noticeable input or response lag at any point

## 7. Edge Cases

- Invalid static data:
  - Level data (error out)
  - Config data (error out)
  - Task data (error out)
  - Tutorial flags (console error and re-set to default state)
- Excessive pause/resume, idle, active timing
- Tool-assisted spammed input (debounce or disregard)
- User-entered spammed input (depends on timing, likely just task failure)
- Reserved keybindings (game should pause when stage focus lost)
