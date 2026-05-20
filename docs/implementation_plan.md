# Implementation Plan

## Sandbox (Task Tuning Tool)
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

## Vertical Slices
1. Implement static UI to wrap game stage, doesn't have to include graphics, just functionality
  - Start menu
  - Pause menu
  - About page
  - Settings page
  - Fail page

2. Implement basic level configuration
  - Load task set from persistent data, including failure criteria
  - No progression
  - Implement run failure/termination
  
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
