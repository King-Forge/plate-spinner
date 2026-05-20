export type TaskStatus = "idle" | "active" | "success" | "perfect" | "failure";

export type TaskTimingConfig = {
  successStart: number;
  successEnd: number;
  perfectStart: number;
  perfectEnd: number;
};

export type TaskSnapshot = {
  id: number;
  keyCode: string;
  status: TaskStatus;
  progress: number;
  timingConfig: TaskTimingConfig;

  //null if not flashing
  flashStatus: TaskStatus | null;
};

export type GameSnapshot = TaskSnapshot[];

export type EngineListener = (snapshot: GameSnapshot) => void;

export type TaskConfig = {
  id: number;
  keyCode: string;
  timingConfig: TaskTimingConfig;
  duration: number;
};

export type GameConfig = TaskConfig[];

//patch object for sending partial config updates, only used for sandbox and tuning
export type TaskConfigPatch = {
  keyCode?: string;
  timingConfig?: Partial<TaskTimingConfig>;
  duration?: number;
};

//diagnostic data for individual tasks, uses for sandbox and debug
export type TaskDiag = {
  taskId: number;
  perfectCount: number;
  successCount: number;
  failureCount: number;
};

export const buildTaskDiag = (taskID: number): TaskDiag => {
  return { taskId: taskID, perfectCount: 0, successCount: 0, failureCount: 0 };
};
