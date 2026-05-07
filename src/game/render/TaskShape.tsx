import { Group, Rect, Text } from "react-konva";
import TimingWindowBar from "./TimingWindowBar";
import type { TaskStatus } from "../core/gameTypes";

//mapping task state to component status color, values must be valid HTML5 color strings
const STATE_COLORS = {
  idle: "darkgray",
  active: "gray",
  failure: "red",
  success: "yellow",
  perfect: "green",
};

interface TaskShapeProps {
  taskStatus: TaskStatus;
  taskKey: string;
  taskProgress: number;
  success_start: number;
  success_end: number;
  perfect_start: number;
  perfect_end: number;
}

function TaskShape({
  taskStatus,
  taskKey,
  taskProgress,
  success_start,
  success_end,
  perfect_start,
  perfect_end,
}: TaskShapeProps) {
  const RECT_COLOR = STATE_COLORS[taskStatus];

  //TODO: fix this later to handle display text for other non-alphanumeric keys
  let displayKey = taskKey;
  if (displayKey == " ") {
    displayKey = "SPACE";
  }

  return (
    <>
      <Group>
        <Rect x={600} y={100} width={120} height={80} fill={RECT_COLOR} />
        <Text x={600} y={180} text={displayKey} />
        <TimingWindowBar
          taskProgress={taskProgress}
          success_start={success_start}
          success_end={success_end}
          perfect_start={perfect_start}
          perfect_end={perfect_end}
        />
      </Group>
    </>
  );
}

export default TaskShape;
