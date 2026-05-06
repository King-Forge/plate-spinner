import { useState, useEffect, useRef } from "react";
import { Stage, Layer, Rect } from "react-konva";
import TaskShape from "./TaskShape";
import type { TaskStatus } from "./TaskShape";

const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 400;
//const TASK_STATUS = "success";
const TASK_KEY_CODE = "SPACE";
const TASK_KEY = " ";

//parameters are from 0 to 1
const SUCCESS_START = 0.35;
const SUCCESS_END = 0.65;
const PERFECT_START = 0.45;
const PERFECT_END = 0.55;

function GameStage() {
  const [taskProgress, setTaskProgress] = useState(0);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("perfect");
  const taskProgressRef = useRef(taskProgress);

  useEffect(() => {
    taskProgressRef.current = taskProgress;
  }, [taskProgress]);

  const incrementTaskProgress = () => {
    setTaskProgress((prevTaskProgress) => {
      if (prevTaskProgress >= 1) {
        return 0;
      } else {
        return prevTaskProgress + 0.01;
      }
    });
  };

  useEffect(() => {
    const intervalID = setInterval(() => {
      incrementTaskProgress();
    }, 10);

    return () => clearInterval(intervalID);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log("Key pressed:", event.key);
      const currentProgress = taskProgressRef.current;
      if (event.key === TASK_KEY) {
        if (currentProgress > PERFECT_START && currentProgress < PERFECT_END) {
          setTaskStatus("perfect");
        } else if (
          currentProgress > SUCCESS_START &&
          currentProgress < SUCCESS_END
        ) {
          setTaskStatus("success");
        } else {
          setTaskStatus("failure");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
        {/* render a single task using provided props*/}
        <TaskShape
          taskStatus={taskStatus}
          taskKey={TASK_KEY_CODE}
          taskProgress={taskProgress}
          success_start={SUCCESS_START}
          success_end={SUCCESS_END}
          perfect_start={PERFECT_START}
          perfect_end={PERFECT_END}
        />
      </Layer>
    </Stage>
  );
}

export default GameStage;
