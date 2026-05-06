import { Group, Rect } from "react-konva";

//mapping task state to component status color, values must be valid HTML5 color strings
const STATE_COLORS = {
  failure: "red",
  success: "yellow",
  perfect: "green",
};

interface TimingWindowBarProps {
  taskProgress: number;
  success_start: number;
  success_end: number;
  perfect_start: number;
  perfect_end: number;
}

const BAR_X = 100;
const BAR_Y = 100;
const BAR_HEIGHT = 40;
const BAR_WIDTH = 400;
const BAR_MARGIN = 10;
const INDICATOR_WIDTH = 5;

function TimingWindowBar({
  taskProgress,
  success_start,
  success_end,
  perfect_start,
  perfect_end,
}: TimingWindowBarProps) {
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

  const INIT_IDLE_X = INTERNAL_X;
  const INIT_IDLE_WIDTH = INTERNAL_WIDTH * success_start;

  const INIT_SUCCESS_X = INIT_IDLE_X + INIT_IDLE_WIDTH;
  const INIT_SUCCESS_WIDTH = INTERNAL_WIDTH * (perfect_start - success_start);

  const PERFECT_X = INIT_SUCCESS_X + INIT_SUCCESS_WIDTH;
  const PERFECT_WIDTH = INTERNAL_WIDTH * (perfect_end - perfect_start);

  const TRAILING_SUCCESS_X = PERFECT_X + PERFECT_WIDTH;
  const TRAILING_SUCCESS_WIDTH = INTERNAL_WIDTH * (success_end - perfect_end);

  const TRAILING_IDLE_X = TRAILING_SUCCESS_X + TRAILING_SUCCESS_WIDTH;
  const TRAILING_IDLE_WIDTH = INTERNAL_WIDTH * (1 - success_end);

  //set relative position of indicator to clampedProgress/100 % of the way though timing bar frame
  const INDICATOR_X =
    clampedProgress * INTERNAL_WIDTH + BAR_X + BAR_MARGIN - INDICATOR_WIDTH / 2;
  return (
    <>
      <Group>
        <Rect
          x={BAR_X}
          y={BAR_Y}
          width={BAR_WIDTH}
          height={BAR_HEIGHT}
          stroke="darkgray"
          fill="lightgray"
          strokeWidth={5}
        />
        {/* initial idle window, interaction results in failure*/}
        <Rect
          x={INIT_IDLE_X}
          y={INTERNAL_Y}
          width={INIT_IDLE_WIDTH}
          height={INTERNAL_HEIGHT}
          fill={STATE_COLORS.failure}
        />
        {/* initial success window*/}
        <Rect
          x={INIT_SUCCESS_X}
          y={INTERNAL_Y}
          width={INIT_SUCCESS_WIDTH}
          height={INTERNAL_HEIGHT}
          fill={STATE_COLORS.success}
        />
        {/* perfect window*/}
        <Rect
          x={PERFECT_X}
          y={INTERNAL_Y}
          width={PERFECT_WIDTH}
          height={INTERNAL_HEIGHT}
          fill={STATE_COLORS.perfect}
        />
        {/* trailing success window*/}
        <Rect
          x={TRAILING_SUCCESS_X}
          y={INTERNAL_Y}
          width={TRAILING_SUCCESS_WIDTH}
          height={INTERNAL_HEIGHT}
          fill={STATE_COLORS.success}
        />
        {/* trailing idle window, interaction results in failure*/}
        <Rect
          x={TRAILING_IDLE_X}
          y={INTERNAL_Y}
          width={TRAILING_IDLE_WIDTH}
          height={INTERNAL_HEIGHT}
          fill={STATE_COLORS.failure}
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
