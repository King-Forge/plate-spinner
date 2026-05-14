import { Group, Rect } from "react-konva";
import type { TaskStatus, TaskTimingConfig } from "../core/gameTypes";

//mapping task state to component status color, values must be valid HTML5 color strings
const STATE_COLORS = {
  failure: "red",
  success: "yellow",
  perfect: "green",
};

interface TimingWindowBarProps {
  taskProgress: number;
  timingConfig: TaskTimingConfig;
  flashStatus: TaskStatus | null;
}

const BAR_X = 20;
const BAR_Y = 50;
const BAR_HEIGHT = 40;
const BAR_WIDTH = 400;
const BAR_MARGIN = 10;
const INDICATOR_WIDTH = 5;

function TimingWindowBar({
  taskProgress,
  timingConfig,
  flashStatus,
}: TimingWindowBarProps) {
  //deconstruct timingConfig properties
  const { successStart, successEnd, perfectStart, perfectEnd } = timingConfig;
  //clamp progress to valid values
  let clampedProgress;
  if (taskProgress < 0) {
    clampedProgress = 0;
  } else if (taskProgress > 1) {
    clampedProgress = 1;
  } else {
    clampedProgress = taskProgress;
  }

  //calculate performance windows from passed props
  //all internal components will have the same y origin and height
  //parameters are in the range 0 to 1
  const INTERNAL_Y = BAR_Y + BAR_MARGIN;
  const INTERNAL_X = BAR_X + BAR_MARGIN;
  const INTERNAL_HEIGHT = BAR_HEIGHT - BAR_MARGIN * 2;
  const INTERNAL_WIDTH = BAR_WIDTH - 2 * BAR_MARGIN;

  const INIT_SUCCESS_X = INTERNAL_X + INTERNAL_WIDTH * successStart;
  const INIT_SUCCESS_WIDTH = INTERNAL_WIDTH * (successEnd - successStart);

  const PERFECT_X = INTERNAL_X + INTERNAL_WIDTH * perfectStart;
  const PERFECT_WIDTH = INTERNAL_WIDTH * (perfectEnd - perfectStart);

  //set relative position of indicator to clampedProgress/100 % of the way though timing bar frame
  const INDICATOR_X =
    clampedProgress * INTERNAL_WIDTH + BAR_X + BAR_MARGIN - INDICATOR_WIDTH / 2;

  let borderColor = "darkgray";
  if (flashStatus == "perfect") {
    borderColor = STATE_COLORS["perfect"];
  } else if (flashStatus == "success") {
    borderColor = STATE_COLORS["success"];
  } else if (flashStatus == "failure") {
    borderColor = STATE_COLORS["failure"];
  }
  return (
    <>
      <Group>
        <Rect
          x={BAR_X}
          y={BAR_Y}
          width={BAR_WIDTH}
          height={BAR_HEIGHT}
          stroke={borderColor}
          fill="lightgray"
          strokeWidth={5}
        />
        {/* paint entire internal area with failure window first, overwrite with other windows*/}
        <Rect
          x={INTERNAL_X}
          y={INTERNAL_Y}
          width={INTERNAL_WIDTH}
          height={INTERNAL_HEIGHT}
          fill={STATE_COLORS.failure}
        />
        {/* paint success window*/}
        <Rect
          x={INIT_SUCCESS_X}
          y={INTERNAL_Y}
          width={INIT_SUCCESS_WIDTH}
          height={INTERNAL_HEIGHT}
          fill={STATE_COLORS.success}
        />
        {/* last, paint perfect window on top of everything*/}
        <Rect
          x={PERFECT_X}
          y={INTERNAL_Y}
          width={PERFECT_WIDTH}
          height={INTERNAL_HEIGHT}
          fill={STATE_COLORS.perfect}
        />

        {/* timing progress indicator*/}
        <Rect
          x={INDICATOR_X}
          y={BAR_Y}
          width={INDICATOR_WIDTH}
          height={BAR_HEIGHT}
          fill="black"
        />
      </Group>
    </>
  );
}

export default TimingWindowBar;
