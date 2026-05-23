import Task from "./Task";
import type {
  TaskSnapshot,
  EngineListener,
  GameConfig,
  TaskConfig,
  TaskConfigPatch,
  TaskDiag,
  SimulationState,
} from "./gameTypes";
import { buildTaskDiag } from "./gameTypes";
import validateConfig from "../config/validateConfig";

class GameEngine {
  //TODO: Tasks[] and diagData[] should not be different variables, easy to desync taskId list
  private lastTime: number = 0;
  private frameId: number | null = null;

  //controls if engine is running, RAF loop and lastTime are being updated, snapshots are being sent
  private engineRunning: boolean = false;

  //controls if simulation is running, tasks iterate, game is progressing/paused
  private simulationState: SimulationState = "ready";

  private tasks: Task[] = [];
  private listeners: EngineListener[] = [];
  private diagData: TaskDiag[] = [];

  //re-load task config data; does not mutate simulationState or engineRunning
  //only valid if simulation is not running/paused
  public setGameConfig = (gameConfig: GameConfig): boolean => {
    //validate simulation status
    if (
      this.simulationState === "running" ||
      this.simulationState === "paused"
    ) {
      console.error(
        "cannot re-load configuration data while simulation is running or paused",
        this.simulationState,
      );
      return false;
    }
    //validata gameConfig using helper function
    if (validateConfig(gameConfig) === false) {
      console.error(
        "Config file failed validation and cannot be imported in SetGameConfig",
        gameConfig,
      );
      return false;
    }

    //stop and clear old task data
    this.tasks.forEach((task) => {
      task.stop();
    });
    this.tasks = [];
    this.diagData = [];

    //load tasks and create new diagData
    for (const taskConfig of gameConfig) {
      this.tasks.push(new Task(taskConfig));
      this.diagData.push(buildTaskDiag(taskConfig.id));
    }

    //set simulation state
    this.simulationState = "ready";

    //push initial snapshot
    this.pushSnapshot();

    return true;
  };

  //registers snapshot listener callback, returns function to remove callback
  public subscribe = (listener: EngineListener) => {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb != listener);
    };
  };

  //TODO: Route keys to bound tasks only

  //processes input of bound keypresses to appropriate task
  //(singular, should be no duplicate keybinds on loaded tasks)
  //only valid if engine is running and simulation is running
  public handleInput = (eventCode: string) => {
    //key pressed while not running, no-op
    if (this.engineRunning === false || this.simulationState !== "running") {
      return;
    }
    console.log("Key pressed:", eventCode);
    for (const task of this.tasks) {
      //only send to the first match, should be no duplicates
      if (task.getKeyCode() === eventCode) {
        task.handleInput(eventCode);
        break;
      }
    }
  };

  // The main loop function, handles RAF cycle and lastTime/deltaTime regardless of game state
  private loop = (currentTime: number): void => {
    //if engine has been stopped, disregard leftover callbacks
    if (!this.engineRunning) return;

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

  //function to progress game logic by deltaTime miliseconds if simulation is running
  //returns boolean indicating if state changed
  private update = (deltaTime: number): boolean => {
    //only progress tasks if simulation is running (started and not paused)
    if (this.simulationState === "running") {
      for (const task of this.tasks) {
        const taskResult = task.update(deltaTime);
        if (taskResult) {
          const foundDiag = this.diagData.find(
            (t) => t.taskId === task.getId(),
          );
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

  public start = () => {
    if (!this.engineRunning) {
      this.engineRunning = true;
      this.lastTime = performance.now();

      //push initial state to subscribers
      this.pushSnapshot();
      this.frameId = requestAnimationFrame(this.loop);
    }
  };

  public stop = () => {
    this.engineRunning = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
    //stop all attached tasks
    for (const task of this.tasks) {
      task.stop();
    }
  };

  //request functions to change simulation state: returns true if request was valid & successful, otherwise false
  //if engine is running and game is stopped, starts all active tasks and starts simulation
  public requestGameStart = (): boolean => {
    //check to see if start request is valid
    if (
      this.engineRunning === false ||
      this.simulationState === "running" ||
      this.simulationState === "paused"
    ) {
      console.error(
        `Game start requested from invalid state: engineRunning=${this.engineRunning}, simulationState=${this.simulationState}`,
      );
      return false;
    }

    //if restarting from failure state, need to do some cleanup first
    if (this.simulationState === "failed") {
      for (const task of this.tasks) {
        task.stop();
        task.reset();
      }
    }

    //set simulation state and start all loaded tasks
    this.simulationState = "running";
    for (const task of this.tasks) {
      task.start();
    }
    this.pushSnapshot();
    console.log("Simulation successfully started");
    return true;
  };

  //pauses simulation, leaves task state unchanged, only valid when engine is running
  public requestGamePause = (): boolean => {
    //check to see if pause request is valid
    if (this.engineRunning === false || this.simulationState !== "running") {
      console.error(
        `Game pause requested from invalid state: engineRunning=${this.engineRunning}, simulationState=${this.simulationState}`,
      );
      return false;
    }

    //set simulation state to prevent tasks from iterating
    this.simulationState = "paused";
    console.log("Simulation successfully paused");
    return true;
  };

  //resumes simulation, leaves task status unchanged, only valid when engine is running
  public requestGameResume = (): boolean => {
    //check to see if pause request is valid
    if (this.engineRunning === false || this.simulationState !== "paused") {
      console.error(
        `Game resume requested from invalid state: engineRunning=${this.engineRunning}, simulationState=${this.simulationState}`,
      );
      return false;
    }

    //set simulation status to allow tasks to progress
    this.simulationState = "running";
    console.log("Simulation successfully resumed");
    return true;
  };

  //ends simulation, stops all tasks from updating, preserves current game state. Can only be requested if simulation is running or paused.
  public requestGameStop = (): boolean => {
    //check to see if pause request is valid
    if (
      this.engineRunning === false ||
      this.simulationState === "ready" ||
      this.simulationState === "failed"
    ) {
      console.error(
        `Game resume requested from invalid state: engineRunning=${this.engineRunning}, simulationState=${this.simulationState}`,
      );
      return false;
    }

    this.simulationState = "failed";
    console.log("Simulation successfully terminated");
    return true;
  };

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

  //updates curent task config data with argument data - used for sandbox controls
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
