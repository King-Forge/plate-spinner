import Task from "./Task";
import type {
  SnapshotListener,
  GameConfig,
  TaskConfigPatch,
  TaskRecord,
  SimulationState,
  TaskCounts,
  LevelListener,
  LevelConfig,
  LevelData,
  GameSnapshot,
  GameSummary,
} from "./gameTypes";
import { buildCounts } from "./gameTypes";
import validateConfig from "../config/validateConfig";

class GameEngine {
  private lastTime: number = 0;
  private frameId: number | null = null;

  //controls if engine is running, RAF loop and lastTime are being updated, snapshots are being sent
  private engineRunning: boolean = false;

  //controls if simulation is running, tasks iterate, game is progressing/paused
  private simulationState: SimulationState = "ready";

  private taskRecords: TaskRecord[] = [];
  private levelData: LevelData | null = null;

  private snapshotListeners: SnapshotListener[] = [];
  private levelListeners: LevelListener[] = [];

  //message and task count summary on game over screen
  //built when simulationStatus is set to 'failed' and cleared when game is restarted
  private gameSummary: GameSummary = {
    gameOverMessage: "",
    recordSummaries: [],
  };

  //re-load task config data; does not mutate simulationState or engineRunning
  //only valid if simulation is not running/paused
  public setGameConfig = (gameConfig: GameConfig): boolean => {
    //validate simulation status
    if (
      this.simulationState === "running" ||
      this.simulationState === "paused"
    ) {
      console.error(
        "Cannot re-load configuration data while simulation is running or paused",
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
    this.taskRecords.forEach((taskRecord) => {
      taskRecord.task.stop();
    });
    this.taskRecords = [];

    //load config data into memory, level data into levelData and task configs into array of taskRecords
    //TODO: implement handling of multiple levels, right now hardcoded to only use level [0] (1)
    this.levelData = {
      id: gameConfig[0].id,
      width: gameConfig[0].width,
      height: gameConfig[0].height,
      failureRules: gameConfig[0].failureRules,
    };
    for (const taskConfig of gameConfig[0].taskConfigs) {
      this.taskRecords.push({
        id: taskConfig.id,
        displayName: taskConfig.displayName,
        task: new Task(taskConfig.timingConfig),
        counts: buildCounts(),
        keyBind: taskConfig.keyBind,
        //TODO: fix this to get actual values once I have them in level data
        position: { x: taskConfig.position.x, y: taskConfig.position.y },
        scale: taskConfig.scale,
      });
    }

    //set simulation state
    this.simulationState = "ready";

    //push initial data
    this.pushLevel();
    this.pushSnapshot();

    return true;
  };

  //registers snapshot listener callback, which fires every frame and drives render
  // returns function to remove callback
  public snapshotSubscribe = (newListener: SnapshotListener) => {
    this.snapshotListeners.push(newListener);
    return () => {
      this.snapshotListeners = this.snapshotListeners.filter(
        (cb) => cb != newListener,
      );
    };
  };

  //registers level listener callback, which only fires when config data changes
  // returns function to remove callback
  public levelSubscribe = (newListener: LevelListener) => {
    this.levelListeners.push(newListener);
    return () => {
      this.levelListeners = this.levelListeners.filter(
        (cb) => cb != newListener,
      );
    };
  };

  //processes input of bound keypresses to appropriate task
  //(singular, should be no duplicate keybinds on loaded tasks)
  //only valid if engine is running and simulation is running
  public handleInput = (eventCode: string) => {
    //key pressed while not running, no-op
    if (this.engineRunning === false || this.simulationState !== "running") {
      return;
    }
    console.log("Keypress sent to GameEngine.handleInput:", eventCode);
    for (const taskRecord of this.taskRecords) {
      //only send to the first match, should be no duplicates
      if (taskRecord.keyBind === eventCode) {
        taskRecord.task.handleInput();
        break;
      }
    }
  };

  // The main loop function, handles RAF cycle and lastTime/deltaTime regardless of game state
  private loop = (currentTime: number): void => {
    //if engine has been stopped, disregard leftover callback(s)
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
  //checks if failure rules have been violated and sets simulation state if needed
  //returns boolean indicating if state changed
  private update = (deltaTime: number): boolean => {
    let stateUpdated = false;
    //only progress tasks if simulation is running (started and not paused)
    if (this.simulationState === "running") {
      stateUpdated = true;
      for (const taskRecord of this.taskRecords) {
        const taskResult = taskRecord.task.update(deltaTime);
        if (taskResult === "perfect") {
          taskRecord.counts.perfectCount++;
          taskRecord.counts.missStreak = 0;
        } else if (taskResult === "success") {
          taskRecord.counts.successCount++;
          taskRecord.counts.missStreak = 0;
        } else if (taskResult === "miss") {
          taskRecord.counts.missCount++;
          taskRecord.counts.missStreak++;
        }
      }
      //check new counts against failure state, set simulation state as needed
      if (this.levelData) {
        //iterate through each rule for this level
        for (const failureRule of this.levelData.failureRules) {
          //for missStreak rules, check if referenced task has reached or exceeded rule value
          if (failureRule.ruleType === "missStreak") {
            const foundRecord = this.taskRecords.find(
              (taskRecord) => taskRecord.id === failureRule.taskId,
            );
            //miss streak exceeded, run failed
            if (
              foundRecord &&
              foundRecord.counts.missStreak >= failureRule.value
            ) {
              this.simulationState = "failed";
              this.buildSummary(
                `Run terminated due to miss streak reaching ${failureRule.value}` +
                  ` on ${foundRecord.displayName} (task ${foundRecord.id}).`,
              );
              stateUpdated = true;
            }
          }
          //for totalMisses rules, check if referenced task has reached or exceeded rule value
          else if (failureRule.ruleType === "totalMisses") {
            const foundRecord = this.taskRecords.find(
              (taskRecord) => taskRecord.id === failureRule.taskId,
            );
            //total misses exceeded, run failed
            if (
              foundRecord &&
              foundRecord.counts.missCount >= failureRule.value
            ) {
              this.simulationState = "failed";
              this.buildSummary(
                `Run terminated due to total misses reaching ${failureRule.value}` +
                  ` on ${foundRecord.displayName} (task ${foundRecord.id}).`,
              );
              stateUpdated = true;
              //TODO: resolve conflict or priority issues if multiple tasks fail simultaneously
              //  this code will only print the last gameOverMessage
              //  and will construct the counts array multiple times
            }
          }
        }
      }
    }

    //TODO: fix this to return -what- changed not just boolean (always true if one task is iterating)
    return stateUpdated;
  };

  //update data store with new state to trigger react re-render
  //called on loop-> update or whenever new state is loaded
  private pushSnapshot = (): void => {
    //no-op if levelData is not loaded
    if (this.levelData?.id) {
      //construct snapshot as an array of task snapshots
      const snapshot: GameSnapshot = {
        id: this.levelData.id,
        runStatus: this.simulationState === "failed" ? "failed" : "ok",
        recordSnapshots: [],
      };
      for (const taskRecord of this.taskRecords) {
        snapshot.recordSnapshots.push({
          id: taskRecord.id,
          ...taskRecord.task.getSnapshot(),
        });
      }
      //attach copy of end of game summary to snapshot
      if (this.simulationState === "failed") {
        snapshot.gameSummary = {
          ...this.gameSummary,
          recordSummaries: this.gameSummary.recordSummaries.map(
            (recordSummary) => ({
              ...recordSummary,
            }),
          ),
        };
      }
      //pass snapshot to all registered listeners
      for (const snapshotListener of this.snapshotListeners) {
        snapshotListener(snapshot);
      }
    }
  };

  //update level config with new state to trigger react re-render for all registered listeners
  //called whenever level data changes (e.g. config load, patch)
  //TODO: decide if discarding the config on load and then reconstructing it is worth it, does it change at runtime?
  private pushLevel = (): void => {
    //no-op if levelData is not loaded
    if (this.levelData?.id && this.levelData?.height && this.levelData.width) {
      const levelConfig: LevelConfig = { ...this.levelData, taskConfigs: [] };
      //construct taskConfig as an array of taskRecord configs
      for (const taskRecord of this.taskRecords) {
        levelConfig.taskConfigs.push({
          id: taskRecord.id,
          displayName: taskRecord.displayName,
          keyBind: taskRecord.keyBind,
          timingConfig: taskRecord.task.getConfig(),
          position: { ...taskRecord.position },
          scale: taskRecord.scale,
        });
      }
      //pass level config to all registered listeners
      for (const levelListener of this.levelListeners) {
        levelListener(levelConfig);
      }
    }
  };

  //little helper function to build a run summary
  //builds a GameSummary object with specified message and all task counts
  //or re-initializes summary if empty string is passed
  private buildSummary = (newMessage: string) => {
    //zero out game summary
    if (newMessage === "") {
      this.gameSummary.gameOverMessage = "";
      this.gameSummary.recordSummaries = [];
    }
    // construct gameSummary
    else {
      this.gameSummary.gameOverMessage = newMessage;
      this.gameSummary.recordSummaries = this.taskRecords.map((taskRecord) => {
        return {
          id: taskRecord.id,
          displayName: taskRecord.displayName,
          taskCounts: { ...taskRecord.counts },
        };
      });
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
    //reset to default, uninitialized value
    this.lastTime = 0;
  };

  /*request functions to change simulation state:
  returns true if request was valid & successful, otherwise false*/

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
      for (const taskRecord of this.taskRecords) {
        taskRecord.task.stop();
        //make a new counts object instead of explicitly resetting values, future-proofing if I add more count types
        taskRecord.counts = buildCounts();
        taskRecord.task.reset();
        //zero out last run's summary
        this.buildSummary("");
      }
    }

    //set simulation state and start all loaded tasks
    this.simulationState = "running";
    for (const taskRecord of this.taskRecords) {
      taskRecord.task.start();
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
    this.buildSummary("Run terminated due to user action.");
    this.pushSnapshot();
    console.log("Simulation successfully terminated");
    return true;
  };

  //updates curent task config data with argument data - used for sandbox controls
  //only updates if values have changed
  //TODO: evaluate if this is overly safe and should be (truthy) -> assignment
  public patchTaskConfig = (taskId: number, configPatch: TaskConfigPatch) => {
    let configChanged = false;
    const foundRecord = this.taskRecords.find(
      (taskRecord) => taskRecord.id === taskId,
    );
    if (foundRecord) {
      if (configPatch.keyBind && foundRecord.keyBind !== configPatch.keyBind) {
        foundRecord.keyBind = configPatch.keyBind;
        configChanged = true;
      }
      if (configPatch.timingConfig) {
        foundRecord.task.patchConfig(configPatch.timingConfig);
        configChanged = true;
      }
      if (configPatch.position) {
        if (
          configPatch.position.x &&
          foundRecord.position.x !== configPatch.position.x
        ) {
          foundRecord.position.x = configPatch.position.x;
          configChanged = true;
        }
        if (
          configPatch.position.y &&
          foundRecord.position.y !== configPatch.position.y
        ) {
          foundRecord.position.y = configPatch.position.y;
          configChanged = true;
        }
      }
      if (configPatch.scale && foundRecord.scale !== configPatch.scale) {
        foundRecord.scale = configPatch.scale;
        configChanged = true;
      }
      //if config data was changed, push new level data
      if (configChanged === true) this.pushLevel();
    } else {
      console.log(
        `Error, task ID ${taskId} not found in function patchTaskConfig`,
      );
      return null;
    }
  };

  //debug/sandbox helper function
  //returns task count data for specified task or null if taskId not found
  public getTaskCounts = (taskId: number): TaskCounts | null => {
    const foundRecord = this.taskRecords.find(
      (taskRecord) => taskRecord.id === taskId,
    );
    ///record not found for id taskId
    if (!foundRecord) {
      console.log(
        `Error: count data for task ${taskId} not found in GameEngine function getTaskCounts.`,
      );
      return null;
    } else return { ...foundRecord.counts };
  };

  //debug/sandbox helper function
  //resets task count data for specified task to all 0s
  public resetTaskCounts = (taskId: number) => {
    const foundRecord = this.taskRecords.find(
      (taskRecord) => taskRecord.id === taskId,
    );
    //record not found for id taskID
    if (!foundRecord) {
      console.log(
        `Error: count data for task ${taskId} not found in GameEngine function resetTaskCounts.`,
      );
    }
    //record found, reset all three counts to 0s
    else {
      //make a new counts object instead of explicitly resetting values, future-proofing if I add more count types
      foundRecord.counts = buildCounts();
      //refresh immediately, in case simulation state is paused when this is called
      this.pushSnapshot();
    }
  };
}

export default GameEngine;
