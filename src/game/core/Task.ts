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
    while (this.progress > 1) {
      //if progress past 1 and state is still 'active' (i.e. no input), log failed task'
      if (this.status == "active" || this.status == "failure") {
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
  };

  public getSnapshot = (): TaskSnapshot => {
    return {
      id: this.id,
      key: this.key,
      status: this.status,
      progress: this.progress,
      timingConfig: this.timingConfig,
    };
  };

  public handleInput = (event: KeyboardEvent) => {
    if (event.key === this.key) {
      if (
        this.progress > this.timingConfig.perfectStart &&
        this.progress < this.timingConfig.perfectEnd
      ) {
        this.status = "perfect";
      } else if (
        this.progress > this.timingConfig.successStart &&
        this.progress < this.timingConfig.successEnd
      ) {
        this.status = "success";
      } else {
        this.status = "failure";
      }
    }
  };
}

export default Task;
