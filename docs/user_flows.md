# User Flows & Use Cases

## Use Cases

- Start a new run
- Pause a run
- Resume a run
- Fail a run
- Restart a run
- View Project Details
- Configure User Settings

---

## User Flows

### Flow 1: Start a Run

1. User navigates to page
2. Page displays welcome screen with some simple information and a prominent start button, less prominent about and settings buttons
3. User presses start, start screen no longer visible, replaced by game screen. No settings/about unless game paused.
4. Single task is displayed. Game pauses if this is the first run (no local storage found) and displays a basic welcome message and instructions
5. User interacts with paused screen, game begins
6. User completes task(s)
7. New tasks are introduced based on number of successful task iterations & quality of success
8. Run ends when user can't keep up anymore

### Flow 2: Pause and Resume

1. User can pause run at any time using hotkey or pause button
2. All game states/tasks/timers freeze immediately.
3. Game screen is displayed but grayed out/faded to indicate interactivity
4. Information on current run is displayed prominently (run time, progress etc.)
5. Only interaction possible are Resume, Restart (prominent); about, settings (more subtle).
6. Upon resume, 3 second countdown timer is displayed, game resumes immediately

### Flow 3: Fail a Run
1. Failure occurs when a critical task reaches a failure state. Critical tasks will change based on milestones and run progress
2. Upon failure, the game will clearly indicate to the user what has happened by animation, highlighting, text popup, or other means
3. Statistics including run time will be displayed on screen.
4. User will be provided options to restart, return to start, (about), (settings), and non-interactive "log in and save progress" button with "coming soon" subtitle and tooltip

### Flow 4: Restart a Run
1. Restart can be performed from pause screen or failure scren.
2. On restart, local storage flags will be set to indicate which task tutorials have been accomplished.
3. Restart starts a fresh run as if it were the user's first run. Other than tutorial state, no progress is saved.

### Flow 5: View Project Details
1. User can view project details from start, pause, or failure screen
2. Project details will include features, tech stack, and other information pertinent to evaluators or recruiters
3. Product details will include links to LinkedIn and GitHub profiles
4. Future iterations may include pateron or 'buy me a coffee' links
5. Viewing project details should save client state, either using an in-window popup or opening a new window, so users can view this information from the pause screen and still resume a run

### Flow 6: Configure User Settings
1. Configure user settings should be available from start, pause, or failure screen
2. Initially settings will only include sound toggle (when implemented), reset completed tutorials, and force disable tutorials
3. Upon closing settings, game will return to previous screen (start, pause, or fail)
