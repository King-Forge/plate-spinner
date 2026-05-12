import type { TaskStatus, TaskTimingConfig, TaskSnapshot } from "./gameTypes";

class Task {
  private id: number = 0;
  private key: string = "";
  private status: TaskStatus = "idle";
  //0-1, percentage of task duration
  private progress: number = 0;
  //iteration time of task in seconds
  private duration: number;
  private timingConfig: TaskTimingConfig;

  //time in ms the task should 'flash' with a status color
  private flashTime: number = 0;
  //flash color (redundant in every case except idle failure)
  private flashStatus: TaskStatus | null = null;

  //status change pulls time in ms
  private FLASH_TIME: number = 200;

  //constructor accepts task Id number, key used to trigger task, timing config data object, and optional task duration in seconds
  constructor(
    id: number,
    key: string,
    timingConfig: TaskTimingConfig,
    duration: number = 1,
  ) {
    this.id = id;
    this.key = key;
    this.timingConfig = timingConfig;
    this.duration = duration;
  }

  public start = (): void => {
    if (this.status == "idle") {
      this.status = "active";
    }
  };

  public stop = (): void => {
    if (this.status != "idle") {
      this.progress = 0;
      this.status = "idle";
    }
  };

  public reset = (): void => {
    this.progress = 0;
  };

  //advance task by deltaTime miliseconds
  //handle task rollover without input (failure)
  public update = (deltaTime: number): void => {
    //task is idle, no increment regardless of elapsed time
    if (this.status == "idle") {
      return;
    }
    //advance progress by time delta in ms proportional to duration
    this.progress += deltaTime / 1000 / this.duration;
    //if prograss past 1, roll back to 0.n (looped for edge cases of deltaTime > duration)
    //TODO: need a better way to handle delta T of more than one second. For example: pause game loop when focus is lost or browser cannot redraw
    while (this.progress > 1) {
      //if progress past 1 and state is still 'active' (i.e. no input), log failed task'
      if (this.status == "active") {
        this.status = "failure";
        this.flashTime = this.FLASH_TIME;
        this.flashStatus = "failure";
      }

      //now, check result of the current iteration
      if (this.status == "failure") {
        console.log("Task Failure");
        this.status = "active";
      } else if (this.status == "success") {
        console.log("Task Successful");
        this.status = "active";
      } else if (this.status == "perfect") {
        console.log("Perfect! Nice job!");
        this.status = "active";
      }
      this.progress -= 1;
    }
    //decrement flashTime and reset flashStatus if time elapsed
    this.flashTime = this.flashTime - deltaTime;
    if (this.flashTime <= 0) {
      this.flashTime = 0;
      this.flashStatus = null;
    }
  };

  public getSnapshot = (): TaskSnapshot => {
    return {
      id: this.id,
      key: this.key,
      status: this.status,
      progress: this.progress,
      timingConfig: this.timingConfig,
      flashStatus: this.flashStatus,
    };
  };

  public handleInput = (event: KeyboardEvent) => {
    if (event.key === this.key && this.status == "active") {
      if (
        this.progress > this.timingConfig.perfectStart &&
        this.progress < this.timingConfig.perfectEnd
      ) {
        this.status = "perfect";
        this.flashTime = this.FLASH_TIME;
        this.flashStatus = "perfect";
      } else if (
        this.progress > this.timingConfig.successStart &&
        this.progress < this.timingConfig.successEnd
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
}

export default Task;
