import type { GameConfig } from "../core/gameTypes";
import getKeyDisplayName from "../../ui/keyDisplay";
import { RULE_TYPES } from "../core/gameTypes";

/*helper function for GameEngine to test if passed GameConfig is valid
  argument must be an array
  each array element (level) must contain all levelData properties:
  level id must be a nonzero positive number and must be unique
  level width and level height must be nonzero positive numbers
  failureRules must be an array, each item contains all failureRule properties:
    rule id must be a positive nonzero number
    rule id must match a valid task ID from this level
    ruleType must be a valid FailureRuleType
    value must be a positive nonzero integer
  each level must contain an array named taskConfigs

  taskConfigs' elements must contain all taskConfig properties:
  task id must be a nonzero positive number and must be unique
  displayName must be a non-empty string
  keyBind must be a string recognizeable by getKeyDisplayName
  timingConfig must be an object that contains all timingConfig properties:
    "successStart"/"successEnd"/"perfectStart"/"perfectEnd" must be numbers between 0 (exclusive) and 1 (inclusive)
    "duration" must be a positive nonzero number
  position must be an object that contains nonzero positive "x" and "y" properties
  scale must be a positive nonzero number*/
const validateConfig = (gameConfig: GameConfig): boolean => {
  //set to ensure level IDs are unique
  const levelIdSet = new Set();

  //validate each element, reject if any element is malformed
  //gameConfig must be an array
  if (!Array.isArray(gameConfig)) {
    return false;
  }

  //check criteria for each set of level config data
  for (const levelConfig of gameConfig) {
    //level id must be a nonzero positive number and must be unique
    if (
      typeof levelConfig.id !== "number" ||
      levelConfig.id <= 0 ||
      levelIdSet.has(levelConfig.id)
    ) {
      return false;
    }
    levelIdSet.add(levelConfig.id);

    //level width and level height must be nonzero positive numbers
    if (
      typeof levelConfig.width !== "number" ||
      levelConfig.width <= 0 ||
      typeof levelConfig.height !== "number" ||
      levelConfig.height <= 0
    ) {
      return false;
    }

    //each level must contain an array named failureRules
    if (!Array.isArray(levelConfig.failureRules)) {
      return false;
    }

    //set of rule task IDs, used to make sure each ID is present later in taskConfigs
    const ruleIdSet = new Set();

    for (const failureRule of levelConfig.failureRules) {
      //rule id must be a positive nonzero number
      if (typeof failureRule.taskId !== "number" || failureRule.taskId <= 0) {
        return false;
      }
      ruleIdSet.add(failureRule.taskId);

      //ruleType must be a valid FailureRuleType
      if (!(RULE_TYPES as readonly string[]).includes(failureRule.ruleType)) {
        return false;
      }

      //value must be a positive nonzero integer
      if (!Number.isInteger(failureRule.value) || failureRule.value <= 0) {
        return false;
      }
    }

    //each level must contain an array named taskConfigs
    if (!Array.isArray(levelConfig.taskConfigs)) {
      return false;
    }

    //set to ensure task IDs are unique
    const taskIdSet = new Set();

    //validate each task config data set inside this level
    for (const taskConfig of levelConfig.taskConfigs) {
      //task id must be a nonzero positive number and must be unique
      if (
        typeof taskConfig.id !== "number" ||
        taskConfig.id <= 0 ||
        taskIdSet.has(taskConfig.id)
      ) {
        return false;
      }
      taskIdSet.add(taskConfig.id);

      //displayName must be a non-empty string
      if (
        typeof taskConfig.displayName !== "string" ||
        taskConfig.displayName === ""
      ) {
        return false;
      }

      //keyBind must be a string recognizeable by getKeyDisplayName
      if (
        !(typeof taskConfig.keyBind === "string") ||
        getKeyDisplayName(taskConfig.keyBind) === ""
      ) {
        return false;
      }

      //"successStart"/"successEnd"/"perfectStart"/"perfectEnd" must be numbers between 0 (exclusive) and 1 (inclusive)
      if (!taskConfig.timingConfig) {
        return false;
      } else {
        if (
          typeof taskConfig.timingConfig.successStart !== "number" ||
          taskConfig.timingConfig.successStart <= 0 ||
          taskConfig.timingConfig.successStart > 1 ||
          typeof taskConfig.timingConfig.successEnd !== "number" ||
          taskConfig.timingConfig.successEnd <= 0 ||
          taskConfig.timingConfig.successEnd > 1 ||
          typeof taskConfig.timingConfig.perfectStart !== "number" ||
          taskConfig.timingConfig.perfectStart <= 0 ||
          taskConfig.timingConfig.perfectStart > 1 ||
          typeof taskConfig.timingConfig.perfectEnd !== "number" ||
          taskConfig.timingConfig.perfectEnd <= 0 ||
          taskConfig.timingConfig.perfectEnd > 1
        ) {
          return false;
        }
      }

      //"duration" must be a positive nonzero number
      if (
        typeof taskConfig.timingConfig.duration !== "number" ||
        taskConfig.timingConfig.duration <= 0
      ) {
        return false;
      }

      //position must be an object that contains nonzero positive "x" and "y" properties
      if (!taskConfig.position) {
        return false;
      } else {
        if (
          typeof taskConfig.position.x !== "number" ||
          taskConfig.position.x < 0 ||
          typeof taskConfig.position.y !== "number" ||
          taskConfig.position.y < 0
        ) {
          return false;
        }
      }

      //scale must be a positive nonzero number
      if (typeof taskConfig.scale !== "number" || taskConfig.scale <= 0) {
        return false;
      }

      //rule id must match a valid task ID from this level
      ruleIdSet.delete(taskConfig.id);
    }
    //all items in ruleIdSet matching taskConfig IDs have beem removed, see if there are any left
    if (ruleIdSet.size !== 0) {
      return false;
    }
  }

  return true;
};

export default validateConfig;
