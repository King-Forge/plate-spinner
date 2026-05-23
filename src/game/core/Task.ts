import type {
  TaskStatus,
  TaskSnapshot,
  TaskConfig,
  TaskConfigPatch,
} from "./gameTypes";

class Task {
  private config: TaskConfig;
  private status: TaskStatus = "idle";
  //0-1, percentage of task duration
  private progress: number = 0;
  //iteration time of task in seconds

  //time in ms the task should 'flash' with a status color
  private flashTime: number = 0;
  //flash color (redundant in every case except idle failure)
  private flashStatus: TaskStatus | null = null;

  //status change pulls time in ms
  private FLASH_TIME: number = 200;

  //constructor accepts task Id number, key used to trigger task, timing config data object, and optional task duration in seconds
  constructor(newConfig: TaskConfig) {
    this.config = { ...newConfig, timingConfig: { ...newConfig.timingConfig } };
  }

  public start = (): void => {
    if (this.status == "idle") {
      this.status = "active";
    }
  };

  public stop = (): void => {
    if (this.status != "idle") {
      this.status = "idle";
    }
  };

  public reset = (): void => {
    this.progress = 0;
    this.flashStatus = null;
    this.flashTime = 0;
  };

  //advance task by deltaTime miliseconds
  //returns task result status if iteration completes and null if no iteration completes
  public update = (deltaTime: number): string | null => {
    //task is idle, no increment regardless of elapsed time
    let result = null;
    //task no active, do nothing
    if (this.status == "idle") {
      return null;
    }
    //advance progress by time delta in ms proportional to duration
    this.progress += deltaTime / 1000 / this.config.duration;
    //if prograss past 1, roll back to 0.n (looped for edge cases of deltaTime > duration)
    //TODO: need a better way to handle delta T of more than one second. For example: pause game loop when focus is lost or browser cannot redraw
    while (this.progress > 1) {
      //if progress past 1 and state is still 'active' (i.e. no input), log failed task'
      if (this.status == "active") {
        this.status = "failure";
        this.flashTime = this.FLASH_TIME;
        this.flashStatus = "failure";
        result = "failure";
      }

      //now, check result of the current iteration
      if (this.status == "failure") {
        console.log("Task Failure");
        this.status = "active";
        result = "failure";
      } else if (this.status == "success") {
        console.log("Task Successful");
        this.status = "active";
        result = "success";
      } else if (this.status == "perfect") {
        console.log("Perfect! Nice job!");
        this.status = "active";
        result = "perfect";
      }
      this.progress -= 1;
    }
    //decrement flashTime and reset flashStatus if time elapsed
    this.flashTime = this.flashTime - deltaTime;
    if (this.flashTime <= 0) {
      this.flashTime = 0;
      this.flashStatus = null;
    }
    return result;
  };

  public getSnapshot = (): TaskSnapshot => {
    return {
      id: this.config.id,
      keyCode: this.config.keyCode,
      status: this.status,
      progress: this.progress,
      timingConfig: { ...this.config.timingConfig },
      flashStatus: this.flashStatus,
    };
  };

  //game engine should only pass key events to bound tasks, still double check
  public handleInput = (eventCode: string) => {
    if (eventCode === this.config.keyCode && this.status == "active") {
      if (
        this.progress > this.config.timingConfig.perfectStart &&
        this.progress < this.config.timingConfig.perfectEnd
      ) {
        this.status = "perfect";
        this.flashTime = this.FLASH_TIME;
        this.flashStatus = "perfect";
      } else if (
        this.progress > this.config.timingConfig.successStart &&
        this.progress < this.config.timingConfig.successEnd
      ) {
        this.status = "success";
        this.flashTime = this.FLASH_TIME;
        this.flashStatus = "success";
      } else {
        this.status = "failure";
        this.flashTime = this.FLASH_TIME;
        this.flashStatus = "failure";
      }
    }
  };

  //TODO: implement task ID map in game engine so this doesn't get queried every time you need to find a specific task
  public getId = (): number => {
    return this.config.id;
  };

  //for routing input sonly to those tasks that are bound to it
  public getKeyCode = (): string => {
    return this.config.keyCode;
  };

  //pass a copy of the config data, not a shallow copy or a reference
  public getConfig = (): TaskConfig => {
    return { ...this.config, timingConfig: { ...this.config.timingConfig } };
  };

  //function to change config data of a task, primarily used for sandbox tuning
  //to prevent conflicts, task ID is set only when task is loaded
  public patchConfig = (configPatch: TaskConfigPatch) => {
    if (configPatch.duration) this.config.duration = configPatch.duration;
    if (configPatch.keyCode) this.config.keyCode = configPatch.keyCode;
    if (configPatch.timingConfig?.successStart)
      this.config.timingConfig.successStart =
        configPatch.timingConfig.successStart;
    if (configPatch.timingConfig?.successEnd)
      this.config.timingConfig.successEnd = configPatch.timingConfig.successEnd;
    if (configPatch.timingConfig?.perfectStart)
      this.config.timingConfig.perfectStart =
        configPatch.timingConfig.perfectStart;
    if (configPatch.timingConfig?.perfectEnd)
      this.config.timingConfig.perfectEnd = configPatch.timingConfig.perfectEnd;
  };
}

export default Task;
