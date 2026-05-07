import Task from "./Task";
import type { TaskSnapshot, EngineListener } from "./gameTypes";

class GameEngine {
  private lastTime: number = 0;
  private frameId: number | null = null;
  private running: boolean = false;
  private tasks: Task[] = [];
  private listeners: EngineListener[] = [];

  constructor() {
    this.tasks.push(
      new Task(
        1,
        " ",
        {
          successStart: 0.35,
          successEnd: 0.65,
          perfectStart: 0.45,
          perfectEnd: 0.55,
        },
        1,
      ),
    );
  }

  //registers snapshot listener callback, returns function to remove callback
  public subscribe = (listener: EngineListener) => {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb != listener);
    };
  };

  public handleInput = (event: KeyboardEvent) => {
    console.log("Key pressed:", event.key);
    for (const task of this.tasks) {
      task.handleInput(event);
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
  //returns boolean indicating if state changed (currently always true)
  private update = (deltaTime: number): boolean => {
    for (const task of this.tasks) {
      task.update(deltaTime);
    }

    //fix this to return something meaningful
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

  start(): void {
    if (!this.running) {
      this.running = true;
      this.lastTime = performance.now();

      //start all attached tasks
      for (const task of this.tasks) {
        task.reset();
        task.start();
      }
      //push initial state to subscribers
      this.pushSnapshot();
      this.frameId = requestAnimationFrame(this.loop);
    }
  }

  stop(): void {
    this.running = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
    //stop all attached tasks
    for (const task of this.tasks) {
      task.stop();
    }
  }
}

export default GameEngine;
