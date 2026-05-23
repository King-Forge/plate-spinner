import { useState, useEffect, useRef, useCallback } from "react";
import type { GameUIState, GameSnapshot, GameConfig } from "../core/gameTypes";
import GameEngine from "../core/GameEngine";
import GameStage from "./GameStage";

function GamePage() {
  const [gameState, setGameState] = useState<GameSnapshot>([]);
  const [gameUIState, setGameUIState] = useState<GameUIState>({
    state: "loading",
    overlay: "none",
  });
  const gameEngine = useRef<GameEngine | null>(null);

  //temporary styling for temporary UI, used to test UI state transitions
  const BUTTON_BASE =
    "mt-4 rounded-lg border border-slate-500 px-4 py-2 text-sm font-medium w-fit self-start";
  const BUTTON_CLASSES = {
    active: "bg-emerald-500 text-slate-950 hover:bg-emerald-400",
    inactive: "bg-slate-700 text-slate-100 hover:bg-slate-600",
    disabled: "bg-slate-700 text-slate-400 opacity-40 cursor-not-allowed",
  } as const;
  type buttonClass = keyof typeof BUTTON_CLASSES;

  //test for overlays first since they disable everything else
  //let engine track previous state for next snapshot
  let startButtonState: buttonClass = "disabled",
    runningButtonState: buttonClass = "disabled",
    pauseButtonState: buttonClass = "disabled",
    settingsButtonState: buttonClass = "disabled",
    aboutButtonState: buttonClass = "disabled",
    failedButtonState: buttonClass = "disabled",
    overlayText: string = "";

  if (gameUIState.overlay === "about") {
    startButtonState = "disabled";
    runningButtonState = "disabled";
    pauseButtonState = "disabled";
    settingsButtonState = "disabled";
    aboutButtonState = "active";
    failedButtonState = "disabled";
    overlayText = "about";
  } else if (gameUIState.overlay === "settings") {
    startButtonState = "disabled";
    runningButtonState = "disabled";
    pauseButtonState = "disabled";
    settingsButtonState = "active";
    aboutButtonState = "disabled";
    failedButtonState = "disabled";
    overlayText = "settings";
  } else if (gameUIState.state === "start") {
    startButtonState = "active";
    runningButtonState = "disabled";
    pauseButtonState = "disabled";
    settingsButtonState = "inactive";
    aboutButtonState = "inactive";
    failedButtonState = "disabled";
    overlayText = "no overlay active";
  } else if (gameUIState.state === "running") {
    startButtonState = "disabled";
    runningButtonState = "active";
    pauseButtonState = "inactive";
    settingsButtonState = "disabled";
    aboutButtonState = "disabled";
    failedButtonState = "inactive";
    overlayText = "no overlay active";
  } else if (gameUIState.state === "paused") {
    startButtonState = "disabled";
    runningButtonState = "disabled";
    pauseButtonState = "active";
    settingsButtonState = "inactive";
    aboutButtonState = "inactive";
    failedButtonState = "disabled";
    overlayText = "no overlay active";
  } else if (gameUIState.state === "failed") {
    startButtonState = "inactive";
    runningButtonState = "disabled";
    pauseButtonState = "disabled";
    settingsButtonState = "inactive";
    aboutButtonState = "inactive";
    failedButtonState = "active";
    overlayText = "no overlay active";
  } else {
    //fallthrough condition, should not be reached for any valid UI status
    //leaves all buttons disabled
    console.error("Invalid state reached in GamePage", gameUIState);
  }
  /// ^ remove this when we have a real UI

  //load config data from static config file, then send to gameEngine
  //should only be called to initialize game/level, returns success boolean
  const loadGameConfig = useCallback(async () => {
    //open loading screen and prevent other inputs while config file is fetched/loaded
    const response = await fetch("/game-config.json");
    const jsonData = await response.json();
    const gameConfig = jsonData as GameConfig;
    if (gameEngine.current?.setGameConfig(gameConfig)) return true;
    else return false;
  }, []);

  //initial setup, runs on mount
  //instantiate engine, register state listener, register keyboard handler, start server
  useEffect(() => {
    gameEngine.current = new GameEngine();
    const unsubscribe = gameEngine.current.subscribe((snapshot: GameSnapshot) =>
      setGameState(snapshot),
    );
    gameEngine.current.start();
    const initialize = async () => {
      const goodInit = await loadGameConfig();

      if (goodInit) {
        setGameUIState({ state: "start", overlay: "none" });
      } else {
        //TODO: loading error handler here
      }
    };

    initialize();

    return () => {
      gameEngine.current?.stop();
      unsubscribe();
    };
  }, [loadGameConfig]);

  //re-initialize keyboard handler when task ID changes or when keybind state changes to prevent stale closures
  //TODO: correct for actual gameplay, this is the keyboard handler from sandbox
  useEffect(() => {
    const keyboardEventHandler = (e: KeyboardEvent) => {
      //ignore keydown events if DOM is not active
      if (!(e.target instanceof HTMLElement)) return;
      //ignore subsequent inputs from held key
      if (e.repeat) return;
      //ignore keydown events if editable UI element is active
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
  }, []);

  //user starts game from 'ready' or 'failed' state
  const handleStartGame = () => {
    //no-op unless game can be started (in start or failed state with no overlay)
    if (
      gameUIState.state === "paused" ||
      gameUIState.state === "running" ||
      gameUIState.overlay !== "none"
    ) {
      return;
    }
    if (gameEngine.current?.requestGameStart()) {
      setGameUIState({ state: "running", overlay: "none" });
    }
  };

  //user pauses during a run
  const handlePauseButton = () => {
    //no-op unless game can be paused (must be running) or resumed (must be paused with no overlay)
    if (
      gameUIState.state === "failed" ||
      gameUIState.state === "start" ||
      gameUIState.overlay !== "none"
    ) {
      return;
    }
    //pause
    if (gameUIState.state === "running") {
      if (gameEngine.current?.requestGamePause()) {
        setGameUIState((prev) => ({ ...prev, state: "paused" }));
      }
    }
    //resume
    else if (gameUIState.state === "paused") {
      if (gameEngine.current?.requestGameResume()) {
        setGameUIState({ state: "running", overlay: "none" });
      }
    }
  };

  //open/close settings menu, does not impact gameEngine
  const handleSettings = () => {
    //no-op unless settings overlay can be opened/closed (must not be running & about must not be open)
    if (gameUIState.state === "running" || gameUIState.overlay === "about") {
      return;
    }
    //open settings
    if (gameUIState.overlay === "none") {
      setGameUIState((prev) => {
        if (prev.state === "running") {
          return prev;
        }
        return { ...prev, overlay: "settings" };
      });
    }
    //close settings
    else if (gameUIState.overlay === "settings") {
      setGameUIState((prev) => ({ ...prev, overlay: "none" }));
    }
  };

  //open/close about menu, does not impact gameEngine
  const handleAboutGame = () => {
    //no-op unless settings overlay can be opened/closed (must not be running & settings must not be open)
    if (gameUIState.state === "running" || gameUIState.overlay === "settings") {
      return;
    }
    //open about
    if (gameUIState.overlay === "none") {
      setGameUIState((prev) => {
        if (prev.state === "running") {
          return prev;
        }
        return { ...prev, overlay: "about" };
      });
    }
    //close about
    else if (gameUIState.overlay === "about") {
      setGameUIState((prev) => ({ ...prev, overlay: "none" }));
    }
  };

  //UI response to failed game run, does not impact gameEngine
  const handleRunFailed = () => {
    //no-op unless game was running
    if (gameUIState.state !== "running") {
      return;
    }
    //gameEngine has reported failure of a running game

    //stub for state transition testing, not needed in actual gameplay
    //gameEngine will stop itself then report failure
    //TODO: remove this stub
    if (gameEngine.current?.requestGameStop()) {
      //TODO: remove this stub
      setGameUIState({ state: "failed", overlay: "none" });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* title / temporary page label */}
          <header className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
            Plate Spinner Game (WIP)
          </header>

          {/* GameStage */}
          <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
            <div className="flex w-full justify-center overflow-hidden rounded-lg">
              <GameStage
                gameState={gameState}
                containerWidth={880}
                containerHeight={300}
                levelData={{ levelWidth: 440, levelHeight: 150 }}
              />
            </div>
          </section>

          {/* optional about/settings stub */}
          <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
            <p>{overlayText}</p>
          </section>

          {/* button/control */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
            {/* Start button */}
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
              <button
                className={`${BUTTON_BASE} ${BUTTON_CLASSES[startButtonState]}`}
                onClick={handleStartGame}
              >
                Start
              </button>
            </div>
            {/* Running button */}
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
              <button
                className={`${BUTTON_BASE} ${BUTTON_CLASSES[runningButtonState]}`}
              >
                Running
              </button>
            </div>
            {/* Paused button */}
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
              <button
                className={`${BUTTON_BASE} ${BUTTON_CLASSES[pauseButtonState]}`}
                onClick={handlePauseButton}
              >
                Paused
              </button>
            </div>
            {/* Settings button */}
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
              <button
                className={`${BUTTON_BASE} ${BUTTON_CLASSES[settingsButtonState]}`}
                onClick={handleSettings}
              >
                Settings
              </button>
            </div>
            {/* About button */}
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
              <button
                className={`${BUTTON_BASE} ${BUTTON_CLASSES[aboutButtonState]}`}
                onClick={handleAboutGame}
              >
                About
              </button>
            </div>
            {/* Failed button */}
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
              <button
                className={`${BUTTON_BASE} ${BUTTON_CLASSES[failedButtonState]}`}
                onClick={handleRunFailed}
              >
                Failed
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default GamePage;
