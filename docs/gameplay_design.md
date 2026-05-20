# Gameplay Design

## Core Gameplay Philosophy

- GD-1.1: The primary challenge of this game will be from maintaining multiple tasks in a 'success' state at different rhythms over time.
- GD-1.2: Tasks will be on different intervals of the same 'clock' borrowing from music concepts (half vs quarter notes, triplets, syncopation) but the same overall rhythm for users to fall into
- GD-1.3: If tuned correctly, the game should be engrossing, taking the user's full attention, and satisfying when a successful rhythm is being maintained
- GD-1.4: Run and task scaling should be tuned to maintain a consistent level of challenge and interest, with (in nearly every case) eventual failure that feels fair and spirals down quickly
- GD-1.5: True game mastey is a speedrun to the 'end' (TBD) with minimal or no missed iterations. A full perfect run should feel like a lite verision of a no-hit level-1 dark souls speedrun - conceptually simple, aspirational, but impossible for most players to execute without practice
- GD-1.6: Failure should still bring progress, either through upgrades/achievements, or just through advancing player skill to an appreciable amount between runs. Need to tune it so players don't feel 'stuck'
- GD-1.7: The only failed runs that should actually feel like failure are runs that collapse far earlier than a user's previous runs due to user error.
- GD-1.8: This game is distinct in that it's a scaling, incremental game that isn't an idle game. No autoclikers, no offline progress. Somewhere between the fugue state that comes from proficiency an MMO's skill rotation and passing an expert song on rockband
- GD-1.9: Mechanically, there are no overlapping input bindings for tasks that will be active at the same time - there are more available keys than the game can practically employ at the same time
- GD-1.10: Task timing will be resolved at the end of an interval, but may be 'set' during the interval.
- GD-1.11: Task input is disabled for the remainder of the interval after a single failure input, or the required number (conbined) of success/perfect inputs.
- GD-1.12: Stray inputs should not 'ruin' a task that is (at least) successful that has not reached the end of its interval.
- GD-1.13: When implemented, ther will be no lockout for n-hit tasks with an overload threshold
  
## Difficulty Scaling

- GD-2.1: Difficulty will require extensive testing and live tuning to balance complexity, difficulty, interest, and frustration (i.e. can't objectively define 'fun')
- GD-2.2: When the user is 'on top of' the current task set, run should progress in complexity at a steady rate
- GD-2.3: When user is 'hanging on', run should progress very slowly (i.e. level-specific timer) - allowing the user to learn and get 'on top of' current task set
- GD-2.4: When user is exhibiting mastery of the current task set, run state is too easy to be engaging and should progress quickly to maintain user interest. Note: this should be risky and users can 'outrun' their own ability and lose control of the run
- GD-2.5. When user drops off and begins to 'drown', run should spiral to a failure state fairly quickly to mitigate user frustration
- GD-2.6: As above, some stage(s)/level(s) may be tuned so that keeping all tasks in a success state simultaneously is unrealistic, forcing users to prioritize and switch between task sets to maintain an overall successful run
  
## Progression Behavior

- GD-3.1: As described above, a run will 'progress' or scale in difficulty when certian thresholds are met relative to user performance.
- GD-3.2: Scaling will be represented by increasing numbers of tasks, either added to the existing playing field or zooming-out to expose new tasks
- GD-3.3. Progress towards next 'stage' of complexity should be visually communicated to player, either by slowly scaling screen, displaying stockpiled resources, visual depicition of defeated enemies, literal timer or day/night cycle, etc.
- GD-3.4. Regardless of visual means to indicate progression, the concept of scaling relative to player performance will remain the same
- GD-3.5. the run will inevitably progress, even if the user is barely maintaining the current state. Enough time should be provided to enable user to get 'on top of' task set if they can, and to end the run if they platau
  
## Mastery vs Struggle States

- GD-4.1: A user 'on top of' the current task set means nearly all task iterations are (at least) successful with rare failures
- GD-4.2: A user that is 'hanging on' is indicated by a larger number of failures without complete run failure, counting both both incorrect inputs and missed intervals
- GD-4.3: A user exhibiting mastery is at least successful on every task, and perfect on most tasks
- GD-4.4: A user who is 'drowning' ends their run due to failing critical tasks, either by losing the rhythm of a given run state or 'hanging on' until forced to progress, indicating that they may need more practice/upgrades to maintain the current task set
  
## Failure Philosophy

- GD-5.1: Run failure should be relatively quick when users are overwhelmed, because a prolonged downward spiral is frustrating and not satisfying
- GD-5.2: When a run begins to fail the trend should be revesible in a reasonable amount of time, but should require either better timing than steady-state success or a prolonged period of multi-task success
- GD-5.3: Tuning will be required to ensure users get at least one chance to recover a failing run, but that it terminates quicky if recovery is not rapid and significant
- GD-5.4: Ultimately, users should feel challenged, but the challenge should feel attainable, more "I can do it if I..." and less "holy crap what was that..."
- GD-5.5: How dramatic collapse will be will likely depend on graphics, sounds, and animatons, which are not planned for MVP
  
## Task Dependency Philosophy

- GD-6.1: Early tasks, most new tasks, and the first time a type of task is exposed (i.e. multi-hit, critical, n-hit) should not have dependencies
- GD-6.2: Task dependencies are a way to increase complexity using simple, familiar task structures, where failure to keep up with one could indicate task failure
- GD-6.3. An example of task dependency could be chopping wood, stoking a fire, and cooking a meal to maintain food supplies. Neither wood nor food can be excessively stockpiled, and fire intensity is capped, so to stay fed a constant stream of tasks must be maintained.
- GD-6.4: Upstream tasks may slightly overproduce so One single task failure does not immediately collapse a chain, this needs testing.
- GD-6.5: Only the final task of a chain may be a critical task. Failure of any enabling tasks in a chain cannot cause run failure unless they constrain the critical task into a failure state
- GD-6.6: While a few repeted failures can collapse a chain, stages may be designed so users can only maintain one chain (or a subset of chains), requiring them to prioritize, alternate, and change/re-stablish different interaction patterns/rhythms
- GD-6.7: The concept of intentional task failure should be introduced early with single tasks before users are asked to deliberately ignore and subsequently re-start task chains
- GD-6.8: Chains may have 'momentum' in the form of stockpiles or buffers that enables them to perform their function for a time after a user stops interacting with it, just long enough to keep anoher chain moving.
  
## Future Progression Concepts

- GD-7.1. Future meta-progresson should have two flavors. One is to 'shortcut' stages or tasks a user has already mastered, and one to ease the difficulty for users that are struggling (see 'mastery vs struggle') section
- GD-7.2: 'Shortcut' unlocks should be based on performance and achievement of milestones/challenges - enables players who have mastered a section to skip it and get to their progression stages faster
- GD-7.3: "Upgrade" unlocks should be based on repetition, total tasks performed, number of times a stage is reached, etc. - will enable players wo are struggling with a stage to 'brute-force' blocks without feeling like a crutch
- GD-7.4: Maximum scores should only be attainable with no unlocks or shortcuts. Don't need an explicit modifier here, just don't award points for skipped stages, and fewer points/time for upgraded skills
- GD-7.5: Complete mastery of the game would be successful run from stage 0 with no upgrades enabled. Therefore, need to be able to 'toggle' unlocks or 'disable all upgrades'
- GD-7.6: Once eough content exists, milestone upgrades may be available to 'batch' groups of earlier/simpler tasks not to automate them, but to satisfy multiple tasks on the same timing with a single input (aggreagte multiple tasks into one single advanced task)
