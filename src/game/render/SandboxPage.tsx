import { useState, useEffect, useRef, useCallback } from "react";
import type {
  GameSnapshot,
  TaskCounts,
  GameConfig,
  LevelConfig,
} from "../core/gameTypes";
import GameEngine from "../core/GameEngine";
import GameStage from "./GameStage";
import SandboxControlCard from "./SandboxcontrolCard";
import { renderConfig } from "./renderConfig";

function SandboxPage() {
  const CONTAINER_WIDTH = 440;
  const CONTAINER_HEIGHT = 150;

  const [gameSnapshot, setGameSnapshot] = useState<GameSnapshot>({
    id: 0,
    runStatus: "ok",
    recordSnapshots: [],
  });
  const [levelConfig, setLevelConfig] = useState<LevelConfig>({
    id: 0,
    width: 0,
    height: 0,
    failureRules: [],
    taskConfigs: [],
  });
  const gameEngine = useRef<GameEngine | null>(null);

  //these are UI parameters, they don't control game logic, call game engine functions for that
  const [selectedTaskId, setSelectedTaskId] = useState<number>(0);
  //const [selectedTaskConfig, setSelectedTaskConfig] =
  //    useState<TaskConfig | null>(null);
  const [keyCaptureActive, setKeyCaptureActive] = useState<boolean>(false);
  //used to blur keybind button after keyboard event
  const keybindButtonRef = useRef<HTMLButtonElement | null>(null);

  //counters for task results
  const [selectedTaskCounts, setSelectedTaskCounts] =
    useState<TaskCounts | null>(null);

  //control event handlers
  const handleSuccessStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    gameEngine.current?.patchTaskConfig(selectedTaskId, {
      timingConfig: { successStart: Number(e.target.value) },
    });
  };

  const handleSuccessEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    gameEngine.current?.patchTaskConfig(selectedTaskId, {
      timingConfig: { successEnd: Number(e.target.value) },
    });
  };

  const handlePerfectStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    gameEngine.current?.patchTaskConfig(selectedTaskId, {
      timingConfig: { perfectStart: Number(e.target.value) },
    });
  };

  const handlePerfectEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    gameEngine.current?.patchTaskConfig(selectedTaskId, {
      timingConfig: { perfectEnd: Number(e.target.value) },
    });
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    gameEngine.current?.patchTaskConfig(selectedTaskId, {
      timingConfig: { duration: Number(e.target.value) },
    });
  };

  const handleTaskIDChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTaskId(Number(e.target.value));
  };

  //call GameEngine to resume simulation;
  const handleResumeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    gameEngine.current?.requestGameResume();
    e.currentTarget.blur();
  };

  //call GameEngine to pause simulation;
  const handlePauseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    gameEngine.current?.requestGamePause();
    e.currentTarget.blur();
  };

  const handleKeybindClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setKeyCaptureActive(true);
    e.currentTarget.blur();
  };

  const handleResetCounts = (e: React.MouseEvent<HTMLButtonElement>) => {
    gameEngine.current?.resetTaskCounts(selectedTaskId);
    e.currentTarget.blur();
  };

  //load config data from static config file, then send to gameEngine
  //after load, starts and pauses simulation state
  const loadSandboxConfig = useCallback(async () => {
    gameEngine.current?.requestGameStop();
    const response = await fetch("/game-config.json");
    const jsonData = await response.json();
    const gameConfig = jsonData as GameConfig;
    if (gameEngine.current?.setGameConfig(gameConfig)) {
      gameEngine.current?.requestGameStart();
      gameEngine.current?.requestGamePause();
    } else {
      //TODO: loading error handler here
    }
  }, []);

  //converts level config to JSON format, programmatically generates and clicks download link
  //used for sandbox tuning of task config parameters
  //TODO: implement export for more than one level
  const handleExportConfig = (e: React.MouseEvent<HTMLButtonElement>) => {
    //no-op if lecelConfig does not exist (i.e. not loaded or invalid load)
    if (!levelConfig) return;

    const exportConfig: GameConfig = [levelConfig];

    //convert to JSON and create blob
    const jsonConfig = JSON.stringify(exportConfig, null, 2);
    const configBlob = new Blob([jsonConfig], { type: "application/json" });

    //create temporary DOM element and trigger download
    const configURL = URL.createObjectURL(configBlob);
    const configLink = document.createElement("a");
    configLink.href = configURL;
    configLink.download = "game-config.json";
    document.body.appendChild(configLink);
    configLink.click();

    //cleanup temporary element
    document.body.removeChild(configLink);
    URL.revokeObjectURL(configURL);

    e.currentTarget.blur();
  };

  //end game, re-load game config from file, re-start game and immediately pause
  const handleResetDefault = (e: React.MouseEvent<HTMLButtonElement>) => {
    setSelectedTaskId(0);
    if (gameEngine.current?.requestGameStop()) {
      loadSandboxConfig();
      e.currentTarget.blur();
    } else {
      console.error(
        "Error in handleResetDefault: Can only request game engine stop if simulation state is paused.",
      );
    }
  };

  //initial setup, runs on mount
  //instantiate engine, register state listener, register keyboard handler
  //start game and pause game
  useEffect(() => {
    try {
      gameEngine.current = new GameEngine();
      const snapshotUnsubscribe = gameEngine.current.snapshotSubscribe(
        (snapshot: GameSnapshot) => setGameSnapshot(snapshot),
      );
      const levelUnsubscribe = gameEngine.current.levelSubscribe(
        (levelConfig: LevelConfig) => setLevelConfig(levelConfig),
      );
      gameEngine.current.start();
      loadSandboxConfig();

      return () => {
        gameEngine.current?.requestGameStop();
        gameEngine.current?.stop();
        snapshotUnsubscribe();
        levelUnsubscribe();
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error("Logged Error:", error.message); // Safely access .message
      } else {
        console.error("An unknown error occurred", error);
      }
    }
  }, [loadSandboxConfig]);

  //re-initialize keyboard handler when task ID changes or when keybind state changes to prevent stale closures
  useEffect(() => {
    const keyboardEventHandler = (e: KeyboardEvent) => {
      //ignore keydown events if DOM is not active
      if (!(e.target instanceof HTMLElement)) return;
      //ignore subsequent inputs from held key
      if (e.repeat) return;
      //system is awaiting keybind input, capture next keypress and exit binding state
      if (keyCaptureActive) {
        //if user presses escape during keybind, cancel rebinding
        if (e.code === "Escape") {
          setKeyCaptureActive(false);
          keybindButtonRef.current?.blur();
          return;
        }
        //check to see if key is valid (alphanumeric)
        const isAlphanumeric = /^(Key[A-Z]|Digit[0-9]|Numpad[0-9])$/.test(
          e.code,
        );
        if (isAlphanumeric) {
          gameEngine.current?.patchTaskConfig(selectedTaskId, {
            keyBind: e.code,
          });
          setKeyCaptureActive(false);
        }

        keybindButtonRef.current?.blur();
        return;
      }
      //if not rebinding key, ignore keydown events if editable UI element is active
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.tagName === "SELECT" ||
        e.target.tagName === "BUTTON" ||
        e.target.isContentEditable
      ) {
        return;
      }

      //if not rebinding and editable UI element is not active, pass key code to gameEngine for action
      gameEngine.current?.handleInput(e.code);
    };
    window.addEventListener("keydown", keyboardEventHandler);
    return () => {
      window.removeEventListener("keydown", keyboardEventHandler);
    };
  }, [selectedTaskId, keyCaptureActive]);

  //re-queries counts for selected task when gameSnapshot changes or new taskId is selected
  //sets riggers re-render only if counts changed
  //sets counts to 'null' if taskId was not found in gameEngine
  //or if gameEngine not initialized
  useEffect(() => {
    let newCounts: TaskCounts | null | undefined;
    if (selectedTaskId !== 0) {
      newCounts = gameEngine.current?.getTaskCounts(selectedTaskId);
    }
    //taskId found
    if (newCounts) {
      //if counts changed, set state (re-render), else NO-OP
      setSelectedTaskCounts((prev) => {
        if (
          newCounts.perfectCount !== prev?.perfectCount ||
          newCounts.successCount !== prev?.successCount ||
          newCounts.missCount !== prev?.missCount
        ) {
          return newCounts;
        } else return prev;
      });
    }
    //counts not found for selected Task ID, error state, zero out state variable
    else {
      console.error(
        `taskId ${selectedTaskId} not found in update counts useEffect() in SandboxPage`,
      );
      setSelectedTaskCounts(null);
    }
  }, [gameSnapshot, selectedTaskId]);

  //watches for run status to change from 'ok' or 'danger' to 'failed'
  //  automatically restarts and pauses the simulation to sandbox is always in 'running' or 'paused' state
  //  to the user, task progress and counts will reset/pause periodically during tuning
  useEffect(() => {
    //current run has just transitioned to 'failed'
    if (gameSnapshot.runStatus === "failed") {
      gameEngine.current?.requestGameStart();
      gameEngine.current?.requestGamePause();
    }
  }, [gameSnapshot.runStatus]);

  //so i don't have to do this find repeatedly inside the TSX below:
  let selectedTaskConfig = levelConfig.taskConfigs.find(
    (taskConfig) => taskConfig.id === selectedTaskId,
  );
  //override task config position and scale for display in sandbox
  if (selectedTaskConfig) {
    selectedTaskConfig = {
      ...selectedTaskConfig,
      position: {
        x: (CONTAINER_WIDTH - renderConfig.BAR_WIDTH) / 2,
        y: (CONTAINER_HEIGHT - renderConfig.BAR_HEIGHT) / 2,
      },
      scale: 3,
    };
  }

  return (
    <>
      <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* title / temporary page label */}
          <header className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
            Plate Spinner Sandbox Tool (WIP)
          </header>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
            {/* render a single task using provided props*/}
            <div className="lg:col-span-2 rounded-xl bg-slate-800 border border-slate-700 p-4 shadow-md min-h-50">
              <GameStage
                gameSnapshot={gameSnapshot}
                containerWidth={CONTAINER_WIDTH}
                containerHeight={CONTAINER_HEIGHT}
                levelConfig={{
                  ...levelConfig,
                  taskConfigs: selectedTaskConfig ? [selectedTaskConfig] : [],
                }}
              />
            </div>
            {/* Task Result Counters, Reset Button, Export button */}
            <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 shadow-md min-h-50">
              <div className="flex h-full flex-col justify-between">
                <div className="grid grid-cols-1 gap-3">
                  {/* Task Result Counters */}
                  <p>Task Name: {selectedTaskConfig?.displayName}</p>
                  <p>
                    Total Perfect Successes:{" "}
                    {selectedTaskCounts ? selectedTaskCounts.perfectCount : "_"}
                  </p>
                  <p>
                    Total Non-Perfect Successes:{" "}
                    {selectedTaskCounts ? selectedTaskCounts.successCount : "_"}
                  </p>
                  <p>
                    Total Misses:{" "}
                    {selectedTaskCounts ? selectedTaskCounts.missCount : "_"}
                  </p>
                  <p>
                    Miss Streak:{" "}
                    {selectedTaskCounts ? selectedTaskCounts.missStreak : "_"}
                  </p>
                </div>

                <button
                  className="mt-4 rounded-lg border border-slate-500 bg-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-600 w-fit self-start"
                  onClick={handleResetCounts}
                >
                  Reset Counts
                </button>
              </div>
            </div>
            {/* Export Config Data and Reset Tasks to Default buttons */}
            <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 shadow-md min-h-50">
              <div className="flex h-full flex-col justify-between">
                <button
                  className="mt-4 rounded-lg border border-slate-500 bg-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-600 w-fit self-start"
                  onClick={handleExportConfig}
                >
                  Export Tasks
                </button>
                <button
                  className="mt-4 rounded-lg border border-slate-500 bg-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-600 w-fit self-start"
                  onClick={handleResetDefault}
                >
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
          {/* render task controlls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Success Start Card*/}
            <SandboxControlCard
              label="Success Start (% of duration)"
              value={selectedTaskConfig?.timingConfig.successStart.toString()}
            >
              <input
                className="pt-4"
                id="duration-input"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={selectedTaskConfig?.timingConfig.successStart}
                onChange={handleSuccessStartChange}
              />
            </SandboxControlCard>
            {/* Success End Card*/}
            <SandboxControlCard
              label="Success End (% of duration)"
              value={selectedTaskConfig?.timingConfig.successEnd.toString()}
            >
              <input
                className="pt-4"
                id="duration-input"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={selectedTaskConfig?.timingConfig.successEnd}
                onChange={handleSuccessEndChange}
              />
            </SandboxControlCard>
            {/* Perfect Start Card*/}
            <SandboxControlCard
              label="Perfect Start (% of duration)"
              value={selectedTaskConfig?.timingConfig.perfectStart.toString()}
            >
              <input
                className="pt-4"
                id="duration-input"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={selectedTaskConfig?.timingConfig.perfectStart}
                onChange={handlePerfectStartChange}
              />
            </SandboxControlCard>
            {/* Perfect End Card*/}
            <SandboxControlCard
              label="Perfect End (% of duration)"
              value={selectedTaskConfig?.timingConfig.perfectEnd.toString()}
            >
              <input
                className="pt-4"
                id="duration-input"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={selectedTaskConfig?.timingConfig.perfectEnd}
                onChange={handlePerfectEndChange}
              />
            </SandboxControlCard>
            {/* Duration Card*/}
            <SandboxControlCard
              label="Task Duration (seconds)"
              value={selectedTaskConfig?.timingConfig.duration.toString()}
            >
              <input
                className="pt-4"
                id="duration-input"
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={selectedTaskConfig?.timingConfig.duration}
                onChange={handleDurationChange}
              />
            </SandboxControlCard>
            {/* Keybind Card*/}
            <SandboxControlCard
              label="Task Keybind (KeyCode)"
              value={selectedTaskConfig?.keyBind.toString()}
            >
              <button
                ref={keybindButtonRef}
                className={`
                  w-full rounded-lg border px-4 py-4 text-sm font-medium transition-all duration-150
                  active:scale-95
                  ${
                    keyCaptureActive
                      ? "bg-amber-500 border-amber-300 text-slate-950 animate-pulse shadow-lg shadow-amber-500/20"
                      : "bg-slate-700 border-slate-500 text-slate-100 hover:bg-slate-600 hover:border-slate-400"
                  }
                `}
                id="rebind-task-key"
                onClick={handleKeybindClick}
              >
                {!keyCaptureActive
                  ? "Press to rebind"
                  : "Select char key or [Esc])"}
              </button>
            </SandboxControlCard>
            {/* Select Task by ID, default is no task (0)*/}
            <SandboxControlCard label="Select Task ID">
              <select
                className="w-full rounded-md bg-slate-900 border border-slate-600 px-3 py-2 text-slate-100"
                id="taskID-select"
                value={selectedTaskId}
                onChange={handleTaskIDChange}
              >
                <option className="bg-slate-900 text-slate-100" value={0}>
                  --X--
                </option>
                {gameSnapshot.recordSnapshots.map((recordSnapshot, index) => (
                  <option
                    className="bg-slate-900 text-slate-100"
                    key={index + 1}
                    value={recordSnapshot.id}
                  >
                    {recordSnapshot.id}
                  </option>
                ))}
              </select>
            </SandboxControlCard>
            {/* Iteration Control Card*/}
            <SandboxControlCard label="Task Controls">
              <div className="grid grid-cols-2 gap-2 pt-4">
                <button
                  className="
                        rounded-md
                        px-3
                        py-2
                        font-medium
                        bg-emerald-600
                        hover:bg-emerald-500
                        active:scale-95
                        transition
                        "
                  type="button"
                  onClick={handleResumeClick}
                >
                  Resume
                </button>
                <button
                  className="
                        rounded-md
                        px-3
                        py-2
                        font-medium
                        bg-rose-600
                        hover:bg-rose-500
                        active:scale-95
                        transition
                        "
                  type="button"
                  onClick={handlePauseClick}
                >
                  Pause
                </button>
              </div>
            </SandboxControlCard>
          </div>
        </div>
      </div>
    </>
  );
}

export default SandboxPage;
