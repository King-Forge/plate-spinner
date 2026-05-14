import Task from "./Task";
import type {
  TaskSnapshot,
  EngineListener,
  StartupConfig,
  TaskConfig,
  TaskConfigPatch,
  TaskDiag,
} from "./gameTypes";
import { buildTaskDiag } from "./gameTypes";

class GameEngine {
  private lastTime: number = 0;
  private frameId: number | null = null;
  private running: boolean = false;
  private tasks: Task[] = [];
  private listeners: EngineListener[] = [];
  private diagData: TaskDiag[] = [];

  constructor({ taskConfigs }: StartupConfig) {
    for (const taskConfig of taskConfigs) {
      this.tasks.push(new Task(taskConfig));
      this.diagData.push(buildTaskDiag(taskConfig.id));
    }
  }

  //registers snapshot listener callback, returns function to remove callback
  public subscribe = (listener: EngineListener) => {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb != listener);
    };
  };

  //TODO: Route keys tob bound tasks only
  public handleInput = (eventCode: string) => {
    console.log("Key pressed:", eventCode);
    for (const task of this.tasks) {
      task.handleInput(eventCode);
    }
  };

  // The main loop function
  private loop = (currentTime: number): void => {
    //if engine has been stopped, disregard leftover callbacks
    if (!this.running) return;

    //time passed since last frame (in miliseconds)
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    //progress game state by deltaTime miliseconds
    const stateChanged = this.update(deltaTime);

    //if state has changed, push snapshot and trigger re-render
    if (stateChanged) {
      this.pushSnapshot();
    }

    //register the next frame's callback function
    this.frameId = requestAnimationFrame(this.loop);
  };

  //function to progress game logic by deltaTime miliseconds
  //returns boolean indicating if state changed
  private update = (deltaTime: number): boolean => {
    for (const task of this.tasks) {
      const taskResult = task.update(deltaTime);
      if (taskResult) {
        const foundDiag = this.diagData.find((t) => t.taskId === task.getId());
        if (!foundDiag) {
          console.log(
            `Error: diagnostic data for task ${task.getId()} not found in GameEngine function Update.`,
          );
        } else if (taskResult === "perfect") {
          foundDiag["perfectCount"]++;
        } else if (taskResult === "success") {
          foundDiag["successCount"]++;
        } else if (taskResult === "failure") {
          foundDiag["failureCount"]++;
        }
      }
    }

    //TODO: fix this to return something meaningful
    return true;
  };

  //update data store with new state to trigger react re-render
  private pushSnapshot = (): void => {
    //construct snapshot as an array of task snapshots
    const snapshot: TaskSnapshot[] = [];
    for (const task of this.tasks) {
      snapshot.push(task.getSnapshot());
    }
    //pass snapshot to all registered listeners
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  };

  public start(): void {
    if (!this.running) {
      this.running = true;
      this.lastTime = performance.now();

      //push initial state to subscribers
      this.pushSnapshot();
      this.frameId = requestAnimationFrame(this.loop);
    }
  }

  public stop(): void {
    this.running = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
    //stop all attached tasks
    for (const task of this.tasks) {
      task.stop();
    }
  }

  //utility functon to retrieve the config data of a specified task ID - used for sandbox controls
  public getTaskConfig = (taskId: number): TaskConfig | null => {
    const foundTask = this.tasks.find((task) => task.getId() === taskId);

    if (foundTask) return foundTask.getConfig();
    else {
      console.log(
        `Error, task ID ${taskId} not found in function getTaskConfig`,
      );
      return null;
    }
  };

  public patchTaskConfig = (taskId: number, configPatch: TaskConfigPatch) => {
    const foundTask = this.tasks.find((task) => task.getId() === taskId);
    if (foundTask) {
      foundTask.patchConfig(configPatch);
    } else {
      console.log(
        `Error, task ID ${taskId} not found in function patchTaskConfig`,
      );
      return null;
    }
  };

  public startTask = (taskId: number) => {
    const foundTask = this.tasks.find((task) => task.getId() === taskId);
    if (foundTask) {
      foundTask.start();
    } else {
      console.log(`Error, task ID ${taskId} not found in function startTask`);
      return null;
    }
  };

  public stopTask = (taskId: number) => {
    const foundTask = this.tasks.find((task) => task.getId() === taskId);
    if (foundTask) {
      foundTask.stop();
    } else {
      console.log(`Error, task ID ${taskId} not found in function stopTask`);
      return null;
    }
  };

  public resetTask = (taskId: number) => {
    const foundTask = this.tasks.find((task) => task.getId() === taskId);
    if (foundTask) {
      foundTask.reset();
    } else {
      console.log(`Error, task ID ${taskId} not found in function resetTask`);
      return null;
    }
  };

  //debug/sandbox helper function
  //returns diagnostic data for specified task or null if taskId not found
  public getTaskDiag = (taskId: number): TaskDiag | null => {
    const foundDiag = this.diagData.find((task) => task.taskId === taskId);
    if (!foundDiag) {
      console.log(
        `Error: diagnostic data for task ${taskId} not found in GameEngine function getTaskDiag.`,
      );
      return null;
    } else return { ...foundDiag };
  };

  //debug/sandbox helper function
  //resets diagnostic data for specified task to default state
  public resetTaskDiag = (taskId: number) => {
    const diagIndex = this.diagData.findIndex((task) => task.taskId === taskId);
    //diag not found for id taskID
    if (diagIndex == -1) {
      console.log(
        `Error: diagnostic data for task ${taskId} not found in GameEngine function resetTaskDiag.`,
      );
    }
    //diag found, remove from diagData array and make a new diag for taskId
    else {
      this.diagData.splice(diagIndex, 1);
      this.diagData.push(buildTaskDiag(taskId));
    }
  };
}

export default GameEngine;
