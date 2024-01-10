import { Hooks, Plugin, SettingsType } from '@yarnpkg/core';
import * as dotenv from "dotenv";
import * as path from 'path';
const checkStr = (s: string) => s !== undefined && s.trim() !== ''

declare module '@yarnpkg/core' {
  interface ConfigurationValueMap {
    yenvDebug: boolean | null;
  }
}

const plugin: Plugin<Hooks> = {
  configuration: {
    yenvDebug: {
      description: `set yenv in debug mode (verbose, default: false)`,
      type: SettingsType.BOOLEAN,
      isNullable: true,
      default: false,
    },
  },
  hooks: {
    // @ts-ignore
    setupScriptEnvironment(project, scriptEnv) {
      scriptEnv.YENV = 'LOAD';
      const {configuration} = project;
      const IS_DEBUG = configuration.get(`yenvDebug`);
      const DOTENV_CONFIG_PATH = scriptEnv.DOTENV_CONFIG_PATH;
      const NODE_ENV = scriptEnv.NODE_ENV;
      const ENVFILE_DIR = path.join(project.cwd, scriptEnv.ENVFILE_DIR ?? "");
      let envFile = '';
      if (checkStr(DOTENV_CONFIG_PATH)){
        envFile = DOTENV_CONFIG_PATH;
      }
      if (checkStr(NODE_ENV)){
          envFile = path.join(ENVFILE_DIR ?? "", `.env.${NODE_ENV.toLowerCase()}`);
      }
      if (IS_DEBUG) console.debug(`Resolved .env file: ${envFile}`);
      if (checkStr(envFile)) {
        const processEnv: { [key: string]: any } = {}
        dotenv.config({ processEnv, path: envFile });
        if (IS_DEBUG) console.debug(`Loaded env:`, processEnv);
        Object.assign(scriptEnv, processEnv);
        scriptEnv.YENV = `DONE`;
      }
    },
  }
};

export default plugin;
