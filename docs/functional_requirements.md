# Functional Requirements

## 1. Run Lifecycle

- FR-1.1: The system shall allow a user to start a new run from the start screen.
- FR-1.2: The system shall initialize a run with a single task.
- FR-1.3: The system shall introduce additional tasks based on successful task execution.
- FR-1.4: The system shall automatically scale task complexity during a run.

---

## 2. Task Execution

- FR-2.1: The system shall allow the user to perform actions required to complete tasks.
- FR-2.2: The system shall evaluate task performance as Failure, Acceptable, or Perfect.
- FR-2.3: The system shall track task performance continuously during a run.

---

## 3. Failure Handling

- FR-3.1: The system shall end a run when failure conditions are met.
- FR-3.2: The system shall determine failure based on defined thresholds (e.g., repeated failure, concurrent failures).
- FR-3.3: The system shall display the reason for run termination.

---

## 4. Pause and Resume

- FR-4.1: The system shall allow the user to pause a run at any time.
- FR-4.2: The system shall suspend gameplay while paused.
- FR-4.3: The system shall allow the user to resume a paused run.
- FR-4.4: The system shall provide a countdown before resuming gameplay.

---

## 5. Restart

- FR-5.1: The system shall allow the user to restart a run from the pause or failure state.
- FR-5.2: The system shall reset all run-specific data upon restart.
- FR-5.3: The system shall begin a new run identical to the initial run state.

---

## 6. Tutorial Behavior

- FR-6.1: The system shall detect first-time users via local storage.
- FR-6.2: The system shall display contextual tutorial guidance on first encounter with mechanics.
- FR-6.3: The system shall allow users to disable tutorial prompts.
- FR-6.4: The system shall allow users to reset tutorial completion state.

---

## 7. Settings

- FR-7.1: The system shall allow users to access settings from non-running states.
- FR-7.2: The system shall allow toggling of sound (when implemented).
- FR-7.3: The system shall allow resetting 'completed' tutorials.
- FR-7.4: The system shall allow disabling tutorials.

---

## 8. Project Details

- FR-8.1: The system shall allow users to view project details from non-running states.
- FR-8.2: The system shall display information about features, tech stack, and purpose.
- FR-8.3: The system shall provide links to external profiles (e.g., GitHub, LinkedIn).
- FR-8.4: The system shall preserve game state when viewing project details.

---

## 9. Persistence (MVP Constraints)

- FR-9.1: The system shall not persist run data between sessions.
- FR-9.2: The system may persist tutorial state locally.
- FR-9.3: The system shall not rely on backend services in MVP.

- ## 10. Input Constraints

- FR-10.1: Where possible, the system shall not require more than three concurrent keypresses to complete tasks, to allow for older/budget hardware
- FR-10.2: The system shall not require more than six concurrent keypresses to complete tasks, due to potential hardware or browser constraints.
- FR-10.3: Task concurrency and sequencing shall avoid reserved system/browser shortcuts
