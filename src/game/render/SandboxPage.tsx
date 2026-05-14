import { useState, useEffect, useRef } from "react";
import {
  type GameSnapshot,
  type TaskConfig,
  type TaskDiag,
} from "../core/gameTypes";
import GameEngine from "../core/GameEngine";
import GameStage from "./GameStage";
import SandboxControlCard from "./SandboxcontrolCard";
import defaultSandboxConfig from "../config/defaultSandboxConfig";

function SandboxPage() {
  const [gameState, setGameState] = useState<GameSnapshot>([]);
  const gameEngine = useRef<GameEngine | null>(null);

  //placeholder, TODO: implement way to retrieve taskID list from gameEngine
  const [taskIdList, setTaskIdList] = useState<number[]>([1]);

  //these are UI parameters, they don't control game logic, call game engine functions for that
  const [selectedTaskId, setSelectedTaskId] = useState<number>(0);
  const [selectedTaskConfig, setSelectedTaskConfig] =
    useState<TaskConfig | null>(null);
  const [keyCaptureActive, setKeyCaptureActive] = useState<boolean>(false);
  //used to blur keybind button after keyboard event
  const keybindButtonRef = useRef<HTMLButtonElement | null>(null);

  //counters for task results
  const [selectedTaskDiag, setSelectedTaskDiag] = useState<TaskDiag | null>(
    null,
  );

  //control event handlers
  const handleSuccessStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    gameEngine.current?.patchTaskConfig(selectedTaskId, {
      timingConfig: { successStart: Number(e.target.value) },
    });

    const config = gameEngine.current?.getTaskConfig(selectedTaskId) ?? null;
    setSelectedTaskConfig(config);
  };

  const handleSuccessEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    gameEngine.current?.patchTaskConfig(selectedTaskId, {
      timingConfig: { successEnd: Number(e.target.value) },
    });

    const config = gameEngine.current?.getTaskConfig(selectedTaskId) ?? null;
    setSelectedTaskConfig(config);
  };

  const handlePerfectStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    gameEngine.current?.patchTaskConfig(selectedTaskId, {
      timingConfig: { perfectStart: Number(e.target.value) },
    });

    const config = gameEngine.current?.getTaskConfig(selectedTaskId) ?? null;
    setSelectedTaskConfig(config);
  };

  const handlePerfectEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    gameEngine.current?.patchTaskConfig(selectedTaskId, {
      timingConfig: { perfectEnd: Number(e.target.value) },
    });

    const config = gameEngine.current?.getTaskConfig(selectedTaskId) ?? null;
    setSelectedTaskConfig(config);
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    gameEngine.current?.patchTaskConfig(selectedTaskId, {
      duration: Number(e.target.value),
    });

    const config = gameEngine.current?.getTaskConfig(selectedTaskId) ?? null;
    setSelectedTaskConfig(config);
  };

  const handleTaskIDChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTaskId(Number(e.target.value));
  };

  //call GameEngine to start task (pass taskID);
  const handleStartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    gameEngine.current?.startTask(selectedTaskId);
    e.currentTarget.blur();
  };

  //call GameEngine to stop task (pass taskID);
  const handleStopClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    gameEngine.current?.stopTask(selectedTaskId);
    e.currentTarget.blur();
  };

  //call GameEngine to reset task progress (pass taskID);
  const handleResetClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    gameEngine.current?.resetTask(selectedTaskId);
    e.currentTarget.blur();
  };

  const handleKeybindClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setKeyCaptureActive(true);
    e.currentTarget.blur();
  };

  const handleDiagReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    gameEngine.current?.resetTaskDiag(selectedTaskId);
    e.currentTarget.blur();
  };

  //initial setup, runs on mount
  //instantiate engine, register state listener, register keyboard handler, start server
  useEffect(() => {
    try {
      gameEngine.current = new GameEngine(defaultSandboxConfig);
      const unsubscribe = gameEngine.current.subscribe(
        (snapshot: GameSnapshot) => setGameState(snapshot),
      );
      gameEngine.current.start();

      return () => {
        gameEngine.current?.stop();
        unsubscribe();
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Logged Error:", error.message); // Safely access .message
      } else {
        console.error("An unknown error occurred", error);
      }
    }
  }, []);

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
            keyCode: e.code,
          });
          const config =
            gameEngine.current?.getTaskConfig(selectedTaskId) ?? null;
          setSelectedTaskConfig(config);
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

      gameEngine.current?.handleInput(e.code);
    };
    window.addEventListener("keydown", keyboardEventHandler);
    return () => {
      window.removeEventListener("keydown", keyboardEventHandler);
    };
  }, [selectedTaskId, keyCaptureActive]);

  //if game engine not created yet, wait for initialization
  //retrieve and re-set local config state for new task ID
  useEffect(() => {
    if (!gameEngine.current) return;
    const config = gameEngine.current.getTaskConfig(selectedTaskId);
    setSelectedTaskConfig(config);
  }, [selectedTaskId]);

  //re-queries diagnostic data for selected task when gameState changes or new taskId is selected
  //sets diagnostic data (triggers re-render) only if changed
  //sets diag data to 'null' if taskId diagnostic data was not found in gameEngine
  //or if gameEngine not initialized
  useEffect(() => {
    const newDiag = gameEngine.current?.getTaskDiag(selectedTaskId);
    //diag found for taskId
    if (newDiag) {
      //if counts changed, set state (re-render), else NO-OP
      setSelectedTaskDiag((prev) => {
        if (
          newDiag.taskId !== prev?.taskId ||
          newDiag.perfectCount !== prev?.perfectCount ||
          newDiag.successCount !== prev?.successCount ||
          newDiag.failureCount !== prev?.failureCount
        ) {
          return newDiag;
        } else return prev;
      });
    }
    //diag not found for selected Task ID, zero out diagnostic state
    else {
      setSelectedTaskDiag(null);
    }
  }, [gameState, selectedTaskId]);

  return (
    <>
      <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* Vertical spacing between top bar and controls */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-[500px_1fr] gap-4 items-start">
              {/* render a single task using provided props*/}
              <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 shadow-md min-h-50">
                {
                  <GameStage
                    gameState={gameState}
                    sandboxTaskId={selectedTaskId}
                  />
                }
              </div>
              {/* Task Result Counters & Reset Button */}
              <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 shadow-md min-h-50">
                <div className="flex h-full flex-col justify-between">
                  <div className="grid grid-cols-1 gap-3">
                    {/* Task Result Counters */}
                    <p>
                      Total Perfect Successes:{" "}
                      {selectedTaskDiag ? selectedTaskDiag.perfectCount : "_"}
                    </p>
                    <p>
                      Total Non-Perfect Successes:{" "}
                      {selectedTaskDiag ? selectedTaskDiag.successCount : "_"}
                    </p>
                    <p>
                      Total Failures:{" "}
                      {selectedTaskDiag ? selectedTaskDiag.failureCount : "_"}
                    </p>
                  </div>

                  <button
                    className="mt-4 rounded-lg border border-slate-500 bg-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-600 w-fit self-start"
                    onClick={handleDiagReset}
                  >
                    Reset Counts
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
                value={selectedTaskConfig?.duration.toString()}
              >
                <input
                  className="pt-4"
                  id="duration-input"
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={selectedTaskConfig?.duration}
                  onChange={handleDurationChange}
                />
              </SandboxControlCard>
              {/* Keybind Card*/}
              <SandboxControlCard
                label="Task Keybind (KeyCode)"
                value={selectedTaskConfig?.keyCode.toString()}
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
              {/* Select Task by ID, default is no task*/}
              {/* TODO: get the actual task ID list from gameEngine and default to first task*/}
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
                  {taskIdList.map((taskId, index) => (
                    <option
                      className="bg-slate-900 text-slate-100"
                      key={index + 1}
                      value={taskId}
                    >
                      {taskId}
                    </option>
                  ))}
                </select>
              </SandboxControlCard>
              {/* Iteration Control Card*/}
              <SandboxControlCard label="Task Controls">
                <div className="grid grid-cols-3 gap-2 pt-4">
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
                    onClick={handleStartClick}
                  >
                    Start
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
                    onClick={handleStopClick}
                  >
                    Stop
                  </button>
                  <button
                    className="
                        rounded-md
                        px-3
                        py-2
                        font-medium
                        bg-amber-600
                        hover:bg-amber-500
                        active:scale-95
                        transition
                        "
                    type="button"
                    onClick={handleResetClick}
                  >
                    Reset
                  </button>
                </div>
              </SandboxControlCard>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SandboxPage;
