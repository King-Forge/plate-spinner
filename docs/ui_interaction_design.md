# UI and Interaction Design

## 1. Information Hierarchy

- UID-1.1: Active tasks will be communicated visually with bright colors, borders, highlighting, and animation
- UID-1.2: Inactive tasks will have no progress indicator and will be grayed out
- UID-1.3: Disabled or unavailable tasks will be indicated with strikethrough, crosshatch, and a toast or other unobstusive indicator when the binding is pressed, indicating why the task cannot be actioned (resources, progression, upgrades, etc.)
- UID-1.4: Successful tasks are indicated by a pulse of the task border in the same color that indicates the success interval within the task indicator, and then a persistent tint of that color through the end of the interval
- UID-1.5: Perfect tasks are indicated by a perfect color, as above
- UID-1.6: Failed tasks (incorrect timing) are indicated by a failre color, as above
- UID-1.7: Failed tasks (interval elapsed) are indicated by a failure color pulse but no persistent tint
- UID-1.8: Danger state (critical / run failure) is indicated by repeated pulsing of failure color throughout interval, and should be visually obtrusive. Individual interactions may outline the task in 'success' or 'perfect' but danger pulse may still persist depending on threshold
- UID-1.9: Timing of all tasks will be visually communicated by an indicator sweeping the different state windows (rectangle w/colored bars, circle w/ colored arcs, etc.)
- UID-1.10: Resources will be communicated clearly and visually, whenever possible on-screen between producing and depdndent tasks. Tasks disabled/unavailable due to lack or overproductionof resources will be indicated as described above
- UID-1.11: Run failure will be indicated both visually (highlight or zoom of failed task) and via text as part of failure screen run summary

---

## 2. Task Presentation Philosphy

- UID-2.1: Tasks will be organized both visually/logically by task type (default) and spatially by keyboard binding (optonal/upgrade?)
- UID-2.2: As complexity scales the game stage will either add tasks to available 'empty' space or zoom out, making existing tasks smaller and exposing new ones on game stage boundary
- UID-2.3: The overall game stage view will be static on initial implementation, all active tasks will be on the screen at once, user will not pan around the game area. Game stage will only change based on run progress.
- UID-2.4: Urgent/critical tasks will be visually indicated as described in the preceding section. Urgency should be backed up with graphics/animations in later versions.

---

## 3. Feedback Systems

- UID-3.1: Success will be indicated as described above. Future versions may have a 'status bar' upgrade, or it may be automatic once the run reaches a certian complexity
- UID-3.2: Perfect will look much like success with different colors
- UID-3.3: At minimum, failure will be visually communicated. Failure of critical tasks should be more obvious, and a 'danger' state of a critical task should be more so, via screen flash, zoom, increased visual size/prominence of failing task, etc.
- UID-3.4: Task dependency collapse will be indicated by disabled/unavailable critical tasks, with reason for unavailbility displayed upon attempted interaction (as above)
- UID-3.5: Task will resolve and provide feedback at the end of the task interval

---

## 4. Visual Scaling

- UID-4.1: Task indicators should be elemental & simple enough to be functional at smaller sizes
- UID-4.2: There will be some practical threshold of simultaneous active tasks based on technical limitations and user attention
- UID-4.3: Critical task(s) for each stage of each run will be clearly visually identified, expecially when they change

---
