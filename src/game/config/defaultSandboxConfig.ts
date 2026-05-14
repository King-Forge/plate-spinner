import type { StartupConfig } from "../core/gameTypes";

const defaultSandboxConfig: StartupConfig = {
  numTasks: 1,
  taskConfigs: [
    {
      id: 1,
      keyCode: "KeyA",
      timingConfig: {
        successStart: 0.35,
        successEnd: 0.65,
        perfectStart: 0.45,
        perfectEnd: 0.55,
      },
      duration: 1.5,
    },
  ],
};

export default defaultSandboxConfig;
