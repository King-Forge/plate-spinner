import { Group, Text } from "react-konva";
import TimingWindowBar from "./TimingWindowBar";
import type { TaskSnapshot } from "../core/gameTypes";
import getKeyDisplayName from "../../ui/keyDisplay";

interface TaskShapeProps {
  taskSnapshot: TaskSnapshot;
}

function TaskShape({ taskSnapshot }: TaskShapeProps) {
  const { keyCode, progress, timingConfig, flashStatus } = taskSnapshot;

  //display name of keyCode, returns null if keyCode is non alphanumeric (i.e. 'Space, Ctrl")
  const keyDisplay = getKeyDisplayName(keyCode);

  return (
    <>
      <Group>
        <Text
          x={0}
          y={100}
          width={440}
          align="center"
          text={keyDisplay ?? keyCode}
        />
        <TimingWindowBar
          taskProgress={progress}
          timingConfig={timingConfig}
          flashStatus={flashStatus}
        />
      </Group>
    </>
  );
}

export default TaskShape;
