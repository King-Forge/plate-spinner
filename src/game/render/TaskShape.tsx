import { Group, Text } from "react-konva";
import TimingWindowBar from "./TimingWindowBar";
import type { TaskConfig, TaskSnapshot } from "../core/gameTypes";
import getKeyDisplayName from "../../ui/keyDisplay";
import { renderConfig } from "./renderConfig";

interface TaskShapeProps {
  taskSnapshot: TaskSnapshot;
  taskConfig: TaskConfig;
}

function TaskShape({ taskSnapshot, taskConfig }: TaskShapeProps) {
  //deconstruct props into usable arguments
  const { progress, flashStatus } = taskSnapshot;
  const { keyBind, displayName, timingConfig, position, scale } = taskConfig;

  //get display name of keyCode, returns null if keyCode is non alphanumeric (i.e. 'Space, Ctrl")
  //fallback: display keyCode instead
  const keyDisplay = `[${getKeyDisplayName(keyBind) ?? keyBind}]`;

  return (
    <>
      <Group>
        <TimingWindowBar
          taskProgress={progress}
          timingConfig={timingConfig}
          flashStatus={flashStatus}
          position={position}
          scale={scale}
        />
        <Group
          x={position.x}
          y={
            position.y +
            renderConfig.BAR_HEIGHT * scale +
            renderConfig.LABEL_PADDING
          }
        >
          <Text
            x={0}
            y={0}
            width={renderConfig.BAR_WIDTH * scale}
            align="left"
            fontSize={renderConfig.LABEL_FONTSIZE * scale}
            text={displayName}
          />
          <Text
            x={0}
            y={0}
            width={renderConfig.BAR_WIDTH * scale}
            align="center"
            fontSize={renderConfig.LABEL_FONTSIZE * scale}
            text={keyDisplay}
          />
        </Group>
      </Group>
    </>
  );
}

export default TaskShape;
