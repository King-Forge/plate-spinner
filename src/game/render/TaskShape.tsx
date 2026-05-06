import { Group, Rect, Text } from "react-konva";
import TimingWindowBar from "./TimingWindowBar";

//mapping task state to component status color, values must be valid HTML5 color strings
const STATE_COLORS = {
  failure: "red",
  success: "yellow",
  perfect: "green",
};

export type TaskStatus = "success" | "perfect" | "failure";

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

  return (
    <>
      <Group>
        <Rect x={600} y={100} width={120} height={80} fill={RECT_COLOR} />
        <Text x={600} y={180} text={taskKey} />
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
