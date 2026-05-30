import { Stage, Layer, Rect, Text } from "react-konva";
import TaskShape from "./TaskShape";
import type { GameSnapshot, LevelConfig } from "../core/gameTypes";

interface GameStageProps {
  //contains full render state from game engine
  gameSnapshot: GameSnapshot;

  //used to pass level data to render layer, all units are in level coordinates
  levelConfig: LevelConfig;

  //display dimensions for gameStage (not internal coordinates)
  containerWidth: number;
  containerHeight: number;
}

//accepts game snapshot and level config as props, renders all tasks in game stage
function GameStage({
  gameSnapshot,
  levelConfig,
  containerWidth,
  containerHeight,
}: GameStageProps) {
  //this is what will be displayed in the content layer
  let responseElement;
  //TODO: more robust input validation here, right now I'm just testing for default values
  //  and if the snapshots are for the same level
  if (
    levelConfig.id === 0 ||
    gameSnapshot.recordSnapshots.length === 0 ||
    gameSnapshot.id !== levelConfig.id
  ) {
    responseElement = (
      <Text
        text="Please wait for Level and Snapshot data to populate..."
        x={0}
        y={levelConfig.height / 2}
        width={levelConfig.width}
        align="center"
        fontSize={20}
        fill="black"
      />
    );
  }

  //sandbox passed default (0) task
  else if (levelConfig.taskConfigs.length === 0) {
    responseElement = (
      <Text
        text="Please select a valid task ID"
        x={0}
        y={levelConfig.height / 2}
        width={levelConfig.width}
        align="center"
        fontSize={48}
        fill="black"
      />
    );
  }
  //input data is valid, not in sandbox mode
  else {
    const renderedItems = [];
    //TODO: implement snapshot to config map to reduce execessive iteration/find()
    for (const recordSnapshot of gameSnapshot.recordSnapshots) {
      const foundConfig = levelConfig.taskConfigs.find(
        (taskConfig) => taskConfig.id === recordSnapshot.id,
      );
      if (foundConfig) {
        renderedItems.push(
          <TaskShape
            key={recordSnapshot.id}
            taskSnapshot={recordSnapshot}
            taskConfig={foundConfig}
          />,
        );
      }
    }
    responseElement = <>{renderedItems}</>;
  }

  //find scale of render coordinates to level coordinates
  const renderScale = Math.min(
    containerWidth / levelConfig.width,
    containerHeight / levelConfig.height,
  );

  return (
    <Stage
      width={levelConfig.width * renderScale}
      height={levelConfig.height * renderScale}
    >
      <Layer scaleX={renderScale} scaleY={renderScale}>
        {/* Background rectangle to outline Game Stage*/}
        <Rect
          x={0}
          y={0}
          width={levelConfig.width}
          height={levelConfig.height}
          stroke="darkgray"
          fill="lightgray"
          strokeWidth={5}
        />
        {responseElement}
      </Layer>
    </Stage>
  );
}

export default GameStage;
