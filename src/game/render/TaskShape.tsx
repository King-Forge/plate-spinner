import { Group, Rect, Text } from "react-konva";
import TimingWindowBar from "./TimingWindowBar";
import type { TaskSnapshot } from "../core/gameTypes";

//mapping task state to component status color, values must be valid HTML5 color strings
const STATE_COLORS = {
  idle: "darkgray",
  active: "gray",
  failure: "red",
  success: "yellow",
  perfect: "green",
};

interface TaskShapeProps {
  taskSnapshot: TaskSnapshot;
}

function TaskShape({ taskSnapshot }: TaskShapeProps) {
  const { key, status, progress, timingConfig, flashStatus } = taskSnapshot;
  const RECT_COLOR = STATE_COLORS[status];

  //TODO: fix this later to handle display text for other non-alphanumeric keys
  let displayKey = key;
  if (displayKey == " ") {
    displayKey = "SPACE";
  }

  return (
    <>
      <Group>
        <Rect x={600} y={100} width={120} height={80} fill={RECT_COLOR} />
        <Text x={600} y={180} text={displayKey} />
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
