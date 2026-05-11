# System Architecture

## 1. Purpose

This document serves as the bridge between game behavior and code structure. It should help organize the major responsibilities of the systems' design before implementation.

## 2. Architectural Goals

When structured correctly, implementation should separate major functions (level design / task tuning / local storage / runtime state / render layer) to improve clarity, development, and testing.
As many code modules as possible should be built for automated testing so I'm not doing it all by hand every iteration.
Codr organization should be clear and well commented/structured in case I ask a friend or two to contribute, so they actually know what's going on under the hood.
Implementation should always keep future backend development in mind for things like saving/submitting a run and retrieving upgrade information. Eventually this will be backed by a REST endpoint.

## 3. System Boundary

MVP implementation will be client-only, and the only persistent data will be flags in local storage to track if a task tutorial has been presented (on first exposure)
No backend, no prestige, no upgrades, no user accounts. Rogue-like, not rogue-lite.

## 4. Major Subsystems & Responsibility Boundaries

Render layer
- Static UI elements
- Drawing game state to canvas
- Catch input events and pass to game engine
- No game logic
Game engine
- Current run progression
- Current task set / state
- Primary game loop
- Input handling
- Scoring
- Interact with local storage
- Transient in-memory data only (other than tutorial flags)
- Task dependency resolution
- Task aggregate data (# subsequent failures, etc.)
Task object
- Stores parameters (state windows, duration)
- Stores state of current iteration
- Stores % progress through current iteration
- No data persistence across iterations
Level data
- Task properties
- Progression criteria
- Failure criteria
- Persistent data only (e.g. JSON)
Tuning Sandbox
- Iterate on task configuration - save settings
- Iterate on level design - save settings
- No forced progression or run failure states
- May be implemented as dev game mode or standalone module

## 5. Runtime Flow

Input: Keyboard/Mouse event
-> Render layer handles event and routes to
-> Game engine handles input and updates game & task states
-> Game engine publishes snapshot
-> Render layer displays new state

Update: GetAnimationFrame fires
-> Game engine calculates time delta since last update
-> Game engine updates game state using level/task properties
-> Game engine publishes new snapshot (react SetState callback)

Evaluation: When task reaches iteration boundary during update
-> Task result evaluated based on current state (state remains 'active' if no input)
-> Check task result against level criteria to determine:
-- Should run be terminated?
-- For task dependencies, do other tasks need to be enabled/disabled?
-- Does run need to be progressed?
-> Re-set task state for next iteration
-> Retun control to game engine to complete update

Render: Gane snapshot published
-> React state changes
-> React re-renders components
-> No game logic lives in this layer

Feedback: Run Terminated
-> Zoom in or highlight failed critical task
-> Pause game loop, show game over screen w/ relevant data
-> User can restart or return to start screen

Feedback: Steady State
-> Tasks flash appropriate colors each iteration
-> Some visual representation of run progress is updated based on performance
-> Core gameplay loop continues

Feedback: Progression
-> Query level design for next phase updates
-> Animate updates to game stage (zoom out, fade-in task, etc.)
-> If new task presented, pause immediately and show tutorial
-> Core gameplay loop progresses

## 6. State Ownership

Persistent data (level design, task parameters) will be stored in JSON and persist between sessions.
Boolean flags will be set to indicate if a task tutorial has been displayed (if no localstorage exists, initialize all flags as 'false')
In-memory data will all be stored in game engine. Game engine data only persists for the duration of a single run.
Game engine owns all data needed to execute core loop and game logic, only loosely coupled to render layer.
Render layer subscribes to game snapshot and re-draws when state changes.

## 7. Timing and Update Model

Two different types of events will drive game updates:
User Input (flow above) - update game state based on input but do not advance game time
AnimationFrame (flow above) - game update based on time elapsed since last frame and any saved state from previous input
Render layer runs the same code when snapshot changes, agnostic to what event drove the change

## 8. Task Evaluation Model

Displayed tasks will be idle (disabled) or active(iterating). Tasks not part of the current task set do not have a state.
Tasks state will be set by comparing current task progress to task parameters when input is received.
Multi-hit tasks may have a 'success counter' or 'perfect counter' internally but this will not be exposed to the game engine.
Once set by user input, task state is locked until task iteration completes.
The current state of all tasks will be part of any snapshot published by game engine.
Task state may be shown visually but will only impact game state (dependencies, progress, failure) at end of task iteration.

## 9. Rendering Boundary

As in the flows above, render layer accepts game snapshots and displays game state.
No state updates or event handling logic are owned by the render layer. Render just consumes snapshots from, and passes inputs to, engine.
It will render any valid game snapshot regardless of what's happening 'under the hood' in-memory.
The render layer also captures input events and passes them to the game engine. Render layer takes no other action on input events.
Render layer performs no error handling other than validating snapshot format and normal error handling for react component interactions

## 10. Extensibility Considerations

Code should leave room for eventual backend (REST) implementation, including user login/logout, uploading saved runs, and read/update of prestige status.
These features won't be implemented in MVP, but should not require significant refactor when implemented after MVP.

## 11. Non-Goals

Not building this for multiplayer in MVP. It may not even be feasible given the pace of the game in the browser and, if implemented later, it'll need some significant refactoring.
No anti-cheat.
No plugins/modding/scripting.

## 12. Error/Fault Boundary

Game engine validates all static data (task/level) when initially read/imported.
Game engine validates local storage upon each run start.
Game engine performs local validation of in-memory data including clamping and bounding task states on update, as appropriate.
Game engine validates gameplay inputs keyed to extant tasks only, all other input is discarded silently.
Game engine may push 'critical failure, please reload' snapshot to render layer as appropriate.
Render layer validates game snapshot when published, to include any error data.
