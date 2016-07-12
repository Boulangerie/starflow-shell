import * as _ from 'lodash';
import Promise from 'bluebird';
import * as os from 'os';
import {spawn} from 'child_process';

export const WARNING_OUTPUT_MESSAGE = 'Output muted (set appropriate values for starflow_shell__SPAWN_DISPLAY_OUTPUT and starflow_shell__SPAWN_DEPTH_LIMIT)';
export const WARNING_ERRORS_MUTED = 'Errors detected but muted by the task parameters';

export default function (starflow, config) {
  
  class Spawn extends starflow.BaseExecutable {

    constructor() {
      super('shell.spawn');
    }

    static canDisplayOutput() {
      return config.SPAWN_DISPLAY_OUTPUT && (config.SPAWN_DEPTH_LIMIT >= starflow.logger.depth);
    }

    exec(cmd) {
      starflow.logger.debug('Config variables:' + os.EOL + JSON.stringify(config, null, 2));

      let args, muteErrors, options;
      if (_.size(arguments) === 1 && _.isObject(cmd)) {
        args = cmd.args || [];
        muteErrors = cmd.muteErrors || false;
        options = cmd.options || {};
        cmd = cmd.cmd;
      } else { // cmd is a string (name of the shell command)
        args = _.tail(arguments);
        muteErrors = false;
        options = {};
      }

      return new Promise((resolve, reject) => {
        let childProcess = spawn(cmd, args, _.assign({stdio: 'pipe'}, options));
        let outStream = childProcess.stdout;
        let errStream = childProcess.stderr;

        let outMessage = '';
        if (outStream) {
          outStream.setEncoding('utf8');
          outStream.on('data', (chunk) => {
            outMessage += chunk;
            if (Spawn.canDisplayOutput()) {
              starflow.logger.log(chunk);
            }
          });
        }

        let errorMessage = '';
        if (errStream) {
          errStream.setEncoding('utf8');
          errStream.on('data', (chunk) => errorMessage += chunk);
        }

        childProcess.on('error', (err) => {
          starflow.logger.error('Are you sure "' + cmd + '" is a valid command?');
          reject(err);
        });

        childProcess.on('close', (code) => {
          if (code === 0 || muteErrors) {
            if (outMessage && !Spawn.canDisplayOutput()) {
              starflow.logger.warning(WARNING_OUTPUT_MESSAGE);
            }
            if (code !== 0) {
              starflow.logger.warning(WARNING_ERRORS_MUTED);
            }
            this.storage.set('output', outMessage);
            resolve(outMessage);
          } else {
            reject(new Error(errorMessage));
          }
        });
      });
    }

  }

  return () => new Spawn();
  
}
