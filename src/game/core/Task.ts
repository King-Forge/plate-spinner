import type {
  TaskStatus,
  TaskSnapshot,
  TaskTimingConfig,
  TaskTimingConfigPatch,
} from "./gameTypes";

class Task {
  private config: TaskTimingConfig;
  private status: TaskStatus = "idle";
  //0-1, percentage of task duration
  private progress: number = 0;
  //iteration time of task in seconds

  //time in ms the task should 'flash' with a status color
  private flashTime: number = 0;
  //flash color (redundant in every case except idle miss)
  private flashStatus: TaskStatus | null = null;

  //status change pulls time in ms
  //TODO: offload this to config
  private FLASH_TIME: number = 200;

  //constructor accepts task timing config data object and creates Task object
  constructor(newConfig: TaskTimingConfig) {
    this.config = { ...newConfig };
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
      return result;
    }
    //advance progress by time delta in ms proportional to duration
    this.progress += deltaTime / 1000 / this.config.duration;
    //if prograss past 1, roll back to 0.n (looped for edge cases of deltaTime > duration)
    /*TODO: need a better way to mitigate & handle delta T of more than one second.
      For example: pause game loop when focus is lost or browser cannot redraw*/
    while (this.progress > 1) {
      //if progress past 1 and state is still 'active' (i.e. no input), log missed task'
      if (this.status == "active") {
        this.status = "miss";
        this.flashTime = this.FLASH_TIME;
        this.flashStatus = "miss";
        result = "miss";
      }

      //now, check result of the current iteration
      if (this.status === "miss") {
        console.log("Task Miss");
        this.status = "active";
        result = "miss";
      } else if (this.status === "success") {
        console.log("Task Successful");
        this.status = "active";
        result = "success";
      } else if (this.status === "perfect") {
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
      progress: this.progress,
      flashStatus: this.flashStatus,
    };
  };

  //game engine should only pass key events to bound tasks
  //TODO: decide if a double input code guard is necessary/practical, now that Task doesn't know its keybind
  public handleInput = () => {
    if (this.status == "active") {
      if (
        this.progress > this.config.perfectStart &&
        this.progress < this.config.perfectEnd
      ) {
        this.status = "perfect";
        this.flashTime = this.FLASH_TIME;
        this.flashStatus = "perfect";
      } else if (
        this.progress > this.config.successStart &&
        this.progress < this.config.successEnd
      ) {
        this.status = "success";
        this.flashTime = this.FLASH_TIME;
        this.flashStatus = "success";
      } else {
        this.status = "miss";
        this.flashTime = this.FLASH_TIME;
        this.flashStatus = "miss";
      }
    }
  };

  //pass a copy of the timing config data, not a shallow copy or a reference
  public getConfig = (): TaskTimingConfig => {
    return { ...this.config };
  };

  //function to change config data of a task, primarily used for sandbox tuning
  public patchConfig = (configPatch: TaskTimingConfigPatch) => {
    if (configPatch.duration) this.config.duration = configPatch.duration;
    if (configPatch.successStart)
      this.config.successStart = configPatch.successStart;
    if (configPatch?.successEnd)
      this.config.successEnd = configPatch.successEnd;
    if (configPatch?.perfectStart)
      this.config.perfectStart = configPatch.perfectStart;
    if (configPatch?.perfectEnd)
      this.config.perfectEnd = configPatch.perfectEnd;
  };
}

export default Task;
