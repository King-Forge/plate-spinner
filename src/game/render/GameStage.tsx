import { useState, useEffect } from "react";
import { Stage, Layer, Rect } from "react-konva";
import TaskShape from "./TaskShape";
import type { GameSnapshot } from "../core/gameTypes";
import GameEngine from "../core/GameEngine";

const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 400;

function GameStage() {
  const [gameState, setGameState] = useState<GameSnapshot>([]);

  //initial setup, runs on mount
  //instantiate engine, register state listener, register keyboard handler, start server
  useEffect(() => {
    try {
      const gameEngine = new GameEngine();
      const unsubscribe = gameEngine.subscribe((snapshot: GameSnapshot) =>
        setGameState(snapshot),
      );
      gameEngine.start();

      window.addEventListener("keydown", gameEngine.handleInput);

      return () => {
        gameEngine.stop();
        unsubscribe();
        window.removeEventListener("keydown", gameEngine.handleInput);
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Logged Error:", error.message); // Safely access .message
      } else {
        console.error("An unknown error occurred", error);
      }
    }
  }, []);

  return (
    <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT}>
      <Layer>
        {/* Background rectangle to outline Game Stage*/}
        <Rect
          x={0}
          y={0}
          width={STAGE_WIDTH}
          height={STAGE_HEIGHT}
          stroke="darkgray"
          fill="lightgray"
          strokeWidth={5}
        />
        {/* render a single task using provided props*/}
        {gameState[0] && (
          <TaskShape
            taskStatus={gameState[0].status}
            taskKey={gameState[0].key}
            taskProgress={gameState[0].progress}
            success_start={gameState[0].timingConfig.successStart}
            success_end={gameState[0].timingConfig.successEnd}
            perfect_start={gameState[0].timingConfig.perfectStart}
            perfect_end={gameState[0].timingConfig.perfectEnd}
          />
        )}
      </Layer>
    </Stage>
  );
}

export default GameStage;
