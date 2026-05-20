# Task Design (Initial)

## MVP Scope

- MVP will implement only the Single-hit task type.
- Other task types are design placeholders and should not be implemented until Single-hit feels good in isolation.

## Task Definition
- A task requires [input] - bound keypress or mouse click
- A task has specific timing window(s)
- A task can succeed, fail, or be perfect

## Parameters to Tune per-task
- task type (see below)
- input timing window (success)
- input timing window (perfect)
- repetition frequency
- failure tolerance

## Parameters to Tune for task-set
- concurrency interaction
- syncopation
- avoiding system/browser reserved shortcuts

## Task Dependencies

- Some tasks may generate resources required by other tasks.
- Failure in one task may indirectly cause failure in dependent tasks.
- MVP may not implement dependencies, but task design should not assume tasks are fully independent.
- Intent is more of an assembly-line or pipeline workflow, resuorce storage should be 1-each or very limited
- Any resource pipeline should be synchronized so that if all tasks are running at 'success' (or all 'perfect') there are no bottlenecks or backups

## Task Types
- Task types are conceptual categories. Later design may implement some as modifiers or variants rather than separate systems.
- Single-hit
  - default task, will be implemented first
  - single 'success' window with embedded 'perfect' window
  - missing 'perfect' window on either end by a small margin is still success
- Critical-hit
  - similar to single-hit, except 'perfect' window is outside 'success' window
  - attempting and missing 'perfect' window is task failure
  - think 'staccato'
- Multi-hit
  - multiple inputs required per iteration
  - multiple 'perfect' windows, 'success' windows may or may not be contiguous
  - variants for multi-hit and multi-hit (critical)
  - think 'triplets'
- N-hit
  - user must hit a threshold of n inputs in one task iteration for success
  - user must hit a threshold of n + m inputs in one iteration for 'perfect'
  - think 'tremolo' (use a set of two or more related nodes to implement a 'trill')
  - advanced - may have success and 'perfect' windows or may be entire iteration duration
  - advanced - may have 'overload' state beyond perfect that causes failure - not implemented in MVP
- Hit-except
  - user must perform input at any time during iteration but avoid 'exclusion' windows that would cause failure
  - may be single-hit or n-hit
- Counter-task
  - user must synchronize inputs with adversary rhythm to defend or counter hostile action
  - will appear similar to other task types but timing/criteria will be dynamic based on external state
  - may increase or decrease in difficulty based on success or failure of other tasks

## Questions to Answer in testing
- What feels fair?
- What feels stressful vs frustrating?
- Are task criteria clear without instruction?
- How many tasks can be handled simultaneously?
- Is success/failure criteria clear and visual?
- Is increased complexity of task sets in the 'sweet spot' (challenge without confusion/frustration)
