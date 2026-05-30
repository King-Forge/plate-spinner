import Task from "./Task";

export type TaskStatus = "idle" | "active" | "success" | "perfect" | "miss";

export type GameMode = "game" | "sandbox";

//runtime wrapper for task (state machine) and task metadata
export type TaskRecord = {
  id: number;
  displayName: string;
  task: Task;
  counts: TaskCounts;
  keyBind: string;
  position: { x: number; y: number };
  scale: number;
};

//aggregates task results to drive game logic
export type TaskCounts = {
  perfectCount: number;
  successCount: number;
  missCount: number;
  missStreak: number;
};

export const buildCounts = (): TaskCounts => {
  return { perfectCount: 0, successCount: 0, missCount: 0, missStreak: 0 };
};

export type TaskTimingConfig = {
  successStart: number;
  successEnd: number;
  perfectStart: number;
  perfectEnd: number;
  duration: number;
};

//config data for loading from level data and creating taskRecord and Task objects
export type TaskConfig = {
  id: number;
  displayName: string;
  keyBind: string;
  timingConfig: TaskTimingConfig;
  position: { x: number; y: number };
  scale: number;
};

//different types of failure rules, will be expanded
export const RULE_TYPES = ["missStreak", "totalMisses"] as const;
export type FailureRuleType = (typeof RULE_TYPES)[number];

//single rule for representing run end criteria
//listed by task ID and criteria
export type FailureRule = {
  taskId: number;
  ruleType: FailureRuleType;
  value: number;
};

//runtime data object for storing level data after the level is loaded (& raw config is discarded)
export type LevelData = {
  id: number;
  width: number;
  height: number;
  failureRules: FailureRule[];
};

//this is the type for sending level data from game engine, through the main page, to GameStage
export type LevelConfig = LevelData & {
  taskConfigs: TaskConfig[];
};

//TODO: probably needs more level or progression metadata
export type GameConfig = LevelConfig[];

//snapshot of task object - packaged with metadata from TaskRecord to create RecordSnapshot
export type TaskSnapshot = {
  //TODO: am I using status here or should I remove it?
  //status: TaskStatus;

  progress: number;
  //null if not flashing
  flashStatus: TaskStatus | null;
};

//snapshot of TaskRecord object - packaged into GameSnapshot for sending to subscribed listeners (e.g. render layer)
export type RecordSnapshot = TaskSnapshot & {
  id: number;
};

//companion data for game snapshot, allows engine to indicate status of run to render layer
export type RunStatus = "ok" | "danger" | "failed";

//optional GameSnapshot parameter passsed with gameSnapshot whenever run status is 'failed'
export type GameSummary = {
  gameOverMessage: string;
  recordSummaries: {
    id: number;
    displayName: string;
    taskCounts: TaskCounts;
  }[];
};

export type GameSnapshot = {
  id: number;
  runStatus: RunStatus;
  recordSnapshots: RecordSnapshot[];
  gameSummary?: GameSummary;
};
export type SnapshotListener = (snapshot: GameSnapshot) => void;

export type LevelListener = (snapshot: LevelConfig) => void;

//patch object for sending partial tyiming config update to task, only used for sandbox/tuning
export type TaskTimingConfigPatch = Partial<TaskTimingConfig>;

//patch object for sending partial config update to taskRecord, only used for sandbox/tuning
export type TaskConfigPatch = {
  keyBind?: string;
  timingConfig?: TaskTimingConfigPatch;
  position?: Partial<{ x: number; y: number }>;
  scale?: number;
};

//object used to represent UI state - separate but in sync with GameEngine simulationState - owned by render layer
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
