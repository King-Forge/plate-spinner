import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { GameUIState, GameSnapshot, GameConfig } from "../core/gameTypes";
import GameEngine from "../core/GameEngine";
import GameStage from "./GameStage";
import StartScreen from "./StartScreen";
import AboutScreen from "./AboutScreen";
import SettingsScreen from "./SettingsScreen";
import PauseScreen from "./PauseScreen";

const PAUSE_BUTTON = "Escape";

//custom hook and type for preventing stale closure of keyboard handler functions
//can offload to a seperate file if logic is reused in other pages
type UIActionMap = Record<string, (event: KeyboardEvent) => void>;

function useKeyboardControls(
  actionMap: UIActionMap,
  fallback: React.RefObject<GameEngine> | React.RefObject<null>,
) {
  const actionMapRef = useRef<UIActionMap>(actionMap);

  useEffect(() => {
    actionMapRef.current = actionMap;
  }, [actionMap]);

  //runs once on mount, no dependencies, uses only refs
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const action = actionMapRef.current[event.code];
      if (action) {
        action(event);
      } else {
        fallback.current?.handleInput(event.code);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fallback]);
}

function GamePage() {
  const [gameState, setGameState] = useState<GameSnapshot>([]);
  const [gameUIState, setGameUIState] = useState<GameUIState>({
    state: "loading",
    overlay: "none",
  });
  const gameEngine = useRef<GameEngine | null>(null);

  //user pauses during a run
  const handlePause = useCallback(() => {
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
  }, [gameUIState]);

  const actionMap = useMemo(() => ({ Escape: handlePause }), [handlePause]);

  useKeyboardControls(actionMap, gameEngine);

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
        </div>
      </div>
      {gameUIState.state === "start" && (
        <StartScreen
          onStart={handleStartGame}
          onSettings={handleSettings}
          onAbout={handleAboutGame}
        />
      )}
      {gameUIState.state === "paused" && <PauseScreen onResume={handlePause} />}
      {gameUIState.overlay === "about" && (
        <AboutScreen onClose={handleAboutGame} />
      )}
      {gameUIState.overlay === "settings" && (
        <SettingsScreen onClose={handleSettings} />
      )}
    </>
  );
}

export default GamePage;
