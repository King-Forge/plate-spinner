import { Group, Rect } from "react-konva";
import type { TaskStatus, TaskTimingConfig } from "../core/gameTypes";
import { renderConfig } from "./renderConfig";

interface TimingWindowBarProps {
  taskProgress: number;
  timingConfig: TaskTimingConfig;
  flashStatus: TaskStatus | null;
  position: { x: number; y: number };
  scale: number;
}

function TimingWindowBar({
  taskProgress,
  timingConfig,
  flashStatus,
  position,
  scale,
}: TimingWindowBarProps) {
  //deconstruct timingConfig properties (omit duration,not needed here)
  const { successStart, successEnd, perfectStart, perfectEnd } = timingConfig;
  const barMargin = renderConfig.BAR_MARGIN * scale;
  const barHeight = renderConfig.BAR_HEIGHT * scale;
  const barWidth = renderConfig.BAR_WIDTH * scale;
  //TODO: implement code to handle sub-pixel widths and anti-aliasing for small scales
  const indicatorWidth = renderConfig.INDICATOR_WIDTH * scale;
  //clamp progress to valid values
  //TODO: real error handling here
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
  const internalY = position.y + barMargin;
  const internalX = position.x + barMargin;
  const internalHeight = barHeight - barMargin * 2;
  const internalWidth = barWidth - 2 * barMargin;

  const successX = internalX + internalWidth * successStart;
  const successWidth = internalWidth * (successEnd - successStart);

  const perfectX = internalX + internalWidth * perfectStart;
  const perfectWidth = internalWidth * (perfectEnd - perfectStart);

  //set relative position of indicator to clampedProgress/100 % of the way though timing bar frame
  const indocatorX =
    clampedProgress * internalWidth +
    position.x +
    barMargin -
    indicatorWidth / 2;

  let borderColor = "darkgray";
  if (flashStatus == "perfect") {
    borderColor = renderConfig.STATE_COLORS["perfect"];
  } else if (flashStatus == "success") {
    borderColor = renderConfig.STATE_COLORS["success"];
  } else if (flashStatus == "miss") {
    borderColor = renderConfig.STATE_COLORS["miss"];
  }
  return (
    <>
      <Group>
        <Rect
          x={position.x}
          y={position.y}
          width={barWidth}
          height={barHeight}
          stroke={borderColor}
          fill="lightgray"
          strokeWidth={renderConfig.BORDER_WIDTH}
        />
        {/* paint entire internal area with miss window first, overwrite with other windows*/}
        <Rect
          x={internalX}
          y={internalY}
          width={internalWidth}
          height={internalHeight}
          fill={renderConfig.STATE_COLORS.miss}
        />
        {/* paint success window*/}
        <Rect
          x={successX}
          y={internalY}
          width={successWidth}
          height={internalHeight}
          fill={renderConfig.STATE_COLORS.success}
        />
        {/* last, paint perfect window on top of everything*/}
        <Rect
          x={perfectX}
          y={internalY}
          width={perfectWidth}
          height={internalHeight}
          fill={renderConfig.STATE_COLORS.perfect}
        />

        {/* timing progress indicator*/}
        <Rect
          x={indocatorX}
          y={position.y}
          width={indicatorWidth}
          height={barHeight}
          fill="black"
        />
      </Group>
    </>
  );
}

export default TimingWindowBar;
