# Implementation Plan

## Sandbox (Task Tuning Tool) - COMPLETE

- Already done during design:
  - Basic sandbox separates render, game engine, task
  - Can change task parameters by changing constants in game engine
  - No logging or persistent state
- TODO:
  - Load task state from static data
  - Implement static UI layer for task configuration sliders
  - Save to static data option to preserve tuned task settings
  - Success/Failure/Perfect logging
  - Implement and test basic visuals:
    - success, success interval end
    - perfect, perfect interval end
    - failure, failure interval end
    - critical warning
- COMPLETE 20 May 2026
  - Config persistence approach changed:
    - original: build-time TS config import
    - current: runtime JSON load from /public, export triggers file download
  - Deferred:
    - schema validation library (Zod?) for production config import

## Vertical Slices - INPROC

1. Implement static UI to wrap game stage, doesn't have to include graphics, just functionality (STARTED 20 May 2026)

- Start menu
- Pause menu
- About page
- Settings page
- Fail page
- Complete 27 May 2026
  - Reusable GameStage now supports Game and Sandbox.
  - Added GamePage keyboard input routing w/ custom hook to prevent constant rebinding
  - GameEngine now differentiates between engine state (running boolean) and game state (ready, running, paused, failed)
  - Static pages for start, pause, about, settings, and game over
  - Tested all state transitions manually - temporary keybind to force 'game over'
  - Added option to quit run from pause menu
  - Deferred:
    - ~~Implement engine-driven game over (needs level data/run failure criteria) - replace keybind stub~~ Complete in slice 2
    - ~~Decide where failure criteria lives (in config and in-engine) - task config/level config/other~~ Complete in slice 2
    - Decide if sandbox-only API access needs separation and/or gating based on user credentials
    - Implement state transition confirmation (Paused -> Quit)
    - Cleanup/hardening (added slice 2.5 for error handling and 'fail gracefully' pass)

2. Implement basic level configuration

- Load task set from persistent data, including failure criteria
- No progression
- Implement run failure/termination
- Complete 30 May 2026
  - Refactored config from flat task data to level-aware config
  - Added TaskRecord wrapper around Task state machine
  - Moved ID/keybind/counts/layout/display data out of Task object
  - Added config(level/task) subscription to offload more static data from per-frame snapshot subscription
  - Added level ID sync handling (config vs snapshot) in GameStage
  - Added failure rules for missStreak and totalMisses
  - Added engine-driven run failure and game-over flow - removed 'fail' keybind stub
  - Added run summary data (incl. run faul reason) for Game Over screen
  - Added task display names to gameRecord - used in GamePage, GameOverPage, SandboxPage
  - Added multi-task rendering/gameplay support
  - Centralized render "magic numbers" into render config for future tuning
  - Preserved Sandbox/GamePage separation and kept GameEngine mode-agnostic
  - Deferred:
    - Error handling / graceful failure pass
    - Replace temporary console logs with intentional handling
    - Harden config validation and bad-load behavior
    - Add async config load failure UI
    - Test subscription cleanup more deliberately
    - Review immutable snapshot/config/summary boundaries
    - Audit snapshot pushes for redundant updates
    - Review input-guard authority model
    - Build lookup/action maps for tasks/rules/counts/configs if needed
    - Add pause → quit confirmation
    - Add level start countdown/spin-up
    - Add near-failure/player danger feedback
    - Consider optional task timing offset/phase
    - Revisit render priority when level loading exists
    - Improve Sandbox selected-task display normalization
    - Continue look-and-feel pass for task visuals, spacing, animation, and constants
    - Retest multi-level export/config behavior when multiple levels are added

2.5. Error handling / hardening pass

- Error handling/result patterns
- Config validation shape
- Snapshot push() audit
- Input-guard authority model
- Temporary console logs/code stubs/TODOs
- Confirmation dialogue for pause/quit flow
- Regression testing for SandboxPage against GameEngine/Task/Config changes
- Async config load failure UI
- Handle duplicate task/config ID (in-validation and/or in-engine)

3. Implement basic progression

- Multiple-level persistent data including progression criteria
- Start with single task
- Progress based on player performance
- Test transition between multiple levels
- Test run termination

4. Implement task dependency

- Expand level config data to enable task dependency specification
- Expand game engine to manage task dependency
- Shouldn't impact task object
- Render layer may need to parse some additional data in snapshot (resources, disabled tasks, etc.)

5. Implement lore
   - Add some basic text for the start of a run
   - Add some basic text for the end of a run
   - May inform graphics and gameplay moving forward

6. Implement better look and feel

- Implement graphics for static UI menus
- Replace basic geometric shapes with simple task graphics
- Add static background image for each task set to 'stage' tasks
- Enhance animation of state and warning colors
- Add simple sound effects for tasks and events

## Complete MVP

-Feels:

- Tasks and task sets tuned to feel fair but challenging
- Task sets tuned to feel stressful but not overwhelming
- New task introduction is intuitive without explicit directions
- Task set forces players to let some tasks go idle without immediate run failure
- Technical:
  - All task and config data in static data, offloaded from code constants
  - Multi-level progression implemented
  - Variety of task sets and rhythms implemented
  - Multiple dependent task pipelines implemented
    Testing:
  - All layers thoroughly tested including plausible edge cases
  - Game performance at acceptable levels during most complex (current) task set
  - No memory leaks or dirty cleanup - game can be played over time (or idle over time) without performance degradation or ramping resource usage

## Deferred

- Backing animations for tasks
- More advanced sprites and effects
- Music & Dynamic sound effects
- Mid-game/End-game levels/content
- Backend integration
- Logging and saving runs for submission
- Run statistics and personal high score
- User accounts
- Prestige, Achievements, Unlocks, Upgrades
