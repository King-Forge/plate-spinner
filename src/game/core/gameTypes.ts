export type TaskStatus = "idle" | "active" | "success" | "perfect" | "failure";

export type GameMode = "game" | "sandbox";

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

//this is the type for sending level data from game engine, through the main page, to GameStage
//todo: implement actual level data structure in vertical slice 2
export type LevelData = {
  levelWidth: number;
  levelHeight: number;
};

//object used to represent UI state - separate but in sync with GameEngine simulationState
type LoadingState = {
  state: "loading";
  overlay: "none" | "about" | "settings";
};

//game UI state cannot have an overlay when 'running'
type RunningState = {
  state: "running";
  overlay: "none";
};

type PausedState = {
  state: "paused";
  overlay: "none" | "about" | "settings";
};

type StartState = {
  state: "start";
  overlay: "none" | "about" | "settings";
};

type FailedState = {
  state: "failed";
  overlay: "none" | "about" | "settings";
};

export type GameUIState =
  | LoadingState
  | RunningState
  | PausedState
  | StartState
  | FailedState;

//internal game engine simulation state for handling requests and controling game logic/updates
export type SimulationState = "ready" | "running" | "paused" | "failed";
