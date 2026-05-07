export type TaskStatus = "idle" | "active" | "success" | "perfect" | "failure";

export type TaskTimingConfig = {
  successStart: number;
  successEnd: number;
  perfectStart: number;
  perfectEnd: number;
};

export type TaskSnapshot = {
  id: number;
  key: string;
  status: TaskStatus;
  progress: number;
  timingConfig: TaskTimingConfig;
};

export type GameSnapshot = TaskSnapshot[];

export type EngineListener = (snapshot: GameSnapshot) => void;
