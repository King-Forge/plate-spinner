import { Stage, Layer, Rect, Text } from "react-konva";
import TaskShape from "./TaskShape";
import type { GameSnapshot, LevelData } from "../core/gameTypes";

interface GameStageProps {
  //contains full render state from game engine
  gameState: GameSnapshot;

  //display dimensions for gameStage (not internal coordinates)
  containerWidth: number;
  containerHeight: number;

  //used to pass level data to render layer, all units are in level coordinates
  levelData: LevelData;

  //used to specify only one task Id to display, for sandbox mode
  sandboxTaskId?: number;
}

//accepts GameSnapshot as prop, renders game stage
function GameStage({
  gameState,
  sandboxTaskId,
  containerWidth,
  containerHeight,
  levelData,
}: GameStageProps) {
  //if optional prop proided, use sandbox mode; find specified task
  const isSandboxMode = sandboxTaskId !== undefined;
  let responseElement;
  if (isSandboxMode) {
    const foundTask = gameState.find(
      (taskSnapshot) => taskSnapshot.id === sandboxTaskId,
    );
    //found sandbox element, display it
    if (foundTask) {
      responseElement = <TaskShape taskSnapshot={foundTask} />;
    }
    //sandbox element not found, return placeholder message
    else {
      responseElement = (
        <Text
          text="Please select a valid task ID"
          x={0}
          y={levelData.levelHeight / 2}
          width={levelData.levelWidth}
          align="center"
          fontSize={20}
          fill="black"
        />
      );
    }
  }
  //not in sandbox mode
  else {
    //todo: implement level design data and display
    responseElement = (
      <>
        {gameState.map((taskSnapshot) => (
          <TaskShape key={taskSnapshot.id} taskSnapshot={taskSnapshot} />
        ))}
      </>
    );
  }

  //find scale of render coordinates to level coordinates
  const renderScale = Math.min(
    containerWidth / levelData.levelWidth,
    containerHeight / levelData.levelHeight,
  );

  return (
    <Stage
      width={levelData.levelWidth * renderScale}
      height={levelData.levelHeight * renderScale}
    >
      <Layer scaleX={renderScale} scaleY={renderScale}>
        {/* Background rectangle to outline Game Stage*/}
        <Rect
          x={0}
          y={0}
          width={levelData.levelWidth}
          height={levelData.levelHeight}
          stroke="darkgray"
          fill="lightgray"
          strokeWidth={5}
        />
        {/* if in sandbox mode, render a single task using provided Id number or task selection prompt*/}
        {responseElement}
      </Layer>
    </Stage>
  );
}

export default GameStage;
