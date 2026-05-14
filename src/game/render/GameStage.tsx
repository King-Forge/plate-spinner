import { Stage, Layer, Rect, Text } from "react-konva";
import TaskShape from "./TaskShape";
import type { GameSnapshot } from "../core/gameTypes";

const STAGE_WIDTH = 440;
const STAGE_HEIGHT = 150;

interface GameStageProps {
  gameState: GameSnapshot;
  //used to specify only one task Id to display, for sandbox mode
  sandboxTaskId?: number;
}

//accepts GameSnapshot as prop, renders game stage
function GameStage({ gameState, sandboxTaskId }: GameStageProps) {
  //if in sandbox mode, find selected task
  let foundTask = null;
  if (sandboxTaskId) {
    foundTask = gameState.find(
      (taskSnapshot) => taskSnapshot.id === sandboxTaskId,
    );
  }
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
        {/* if in sandbox mode, render a single task using provided Id number*/}
        {foundTask ? (
          <TaskShape taskSnapshot={foundTask} />
        ) : (
          <Text
            text="Please select a valid task ID"
            x={0}
            y={STAGE_HEIGHT / 2}
            width={STAGE_WIDTH}
            align="center"
            fontSize={20}
            fill="black"
          />
        )}
      </Layer>
    </Stage>
  );
}

export default GameStage;
