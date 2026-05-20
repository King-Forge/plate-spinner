import type { GameConfig } from "../core/gameTypes";
import getKeyDisplayName from "../../ui/keyDisplay";

//helper function for GameEngine to test if passed GameConfig is valid
//argument must be an array, all elements must be contain all TaskConfig properties
//taskId must be non-zero number and must be unique
//duration must be positive non-zero number
//keyCode must be string recognizeable by getKeyDisplayName
//all four timingConfig values must be numbers between 0 and 1, inclusive
const validateConfig = (gameConfig: GameConfig): boolean => {
  const idSet = new Set();
  //gameConfig must be an array
  if (!Array.isArray(gameConfig)) {
    return false;
  }

  //validate each element, reject if any element is malformed
  for (const taskConfig of gameConfig) {
    //taskId must be non-zero number and must be unique
    if (
      !(typeof taskConfig.id === "number") ||
      taskConfig.id === 0 ||
      idSet.has(taskConfig.id)
    ) {
      return false;
    }
    idSet.add(taskConfig.id);
    //duration must be positive non-zero number
    if (
      !(typeof taskConfig.duration === "number") ||
      taskConfig.duration <= 0
    ) {
      return false;
    }
    //keyCode must be string recognizeable by getKeyDisplayName
    if (
      !(typeof taskConfig.keyCode === "string") ||
      getKeyDisplayName(taskConfig.keyCode) === ""
    ) {
      return false;
    }
    //all four timingConfig values must be numbers between 0 and 1, inclusive
    if (
      typeof taskConfig.timingConfig.successStart !== "number" ||
      taskConfig.timingConfig.successStart < 0 ||
      taskConfig.timingConfig.successStart > 1 ||
      typeof taskConfig.timingConfig.successEnd !== "number" ||
      taskConfig.timingConfig.successEnd < 0 ||
      taskConfig.timingConfig.successEnd > 1 ||
      typeof taskConfig.timingConfig.perfectStart !== "number" ||
      taskConfig.timingConfig.perfectStart < 0 ||
      taskConfig.timingConfig.perfectStart > 1 ||
      typeof taskConfig.timingConfig.perfectEnd !== "number" ||
      taskConfig.timingConfig.perfectEnd < 0 ||
      taskConfig.timingConfig.perfectEnd > 1
    ) {
      return false;
    }
  }

  return true;
};

export default validateConfig;
