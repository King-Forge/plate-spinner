# Domain Model

## 1. Purpose

Translates concepts/responsibilities into implementable 'nouns' with more specifics. This is not a DB schema, API contract, or TypeScript implementation, just conceptual outline of what data lives where.

## 2. Domain Entity Responsibilities and Relationships

- Task Definition:
  - Persistent data
  - Defines task duration
  - Defines "Success" and "Perfect" window(s)

- Level/Progression Definition
  - Persistent data
  - Defines each level of progression as a set of tasks
  - Defines layout of tasks (name/position/size/scale)
  - Defines input key(s) for tasks
  - References task definitions for each task
  - Defines any other UI elements that may be present for that stage
  - Defines progression milestones and/or timing
  - Defines critical tasks and run failure criteria

- Task State
  - Runtime data - owned by Task object
  - Initialized by a static task definition
  - Contains and manages current task state
  - Contains and manages 'progress' indicator for % progress of each iteration
    
- Game State
  - Runtime data - owned by Game Engine object - not exposed to render layer
  - Holds static data for current level
  - Tracks and aggregates task data (subsequent/concurrent failures, etc.)
  - Manages task interdependencies by enabling/disabling tasks in current set
  - Manages input events by routing each to the correct task
  - Contains and manages progression, scoring/logging, and run end
  - Includes data for all static (i.e. non-game-stage) UI elements

- Snapshot
  - Runtime data - published by Game Engine object - consumed by render layer
  - See specification below

- Tutorial State
  - Persistent data
  - Key/value pair, keys are levels, values are booleans
  - True = User has seen this level, tutorial has been presented, skip tutorial for this level (or) user force-disabled all tutorials via settings
  - False = User has not seen this level, present tutorial when this task set first comes up (or) user has force-reset all tutorials via settings

- Input Event
  - Transient runtime data
  - Simple keypress or mouseclick event
  - Used to pass (event) data to game engine

## 3. Snapshot Model

- Contains all render-relevant data for current game state
  - All tasks in task set:
    - task timing window(s)
    - task state
    - task progress
  - Level data:
    - Task position/size/scale
    - Other level-specific UI elements
  - Static UI state (pause, about, run failed, etc.)
  - Any errors passed from game engine
