import path from 'path';
import {EOL} from 'os';
import {expect} from 'chai';
import {Writable} from 'stream';
import chalk from 'chalk';
import * as starflow from 'starflow';
import spawnFactoryWrapper, {WARNING_OUTPUT_MESSAGE} from '../lib/spawn';

/* -------------------------------------------------------
 * INIT
 * ---------------------------------------------------- */

const defaultConfig = {
  SPAWN_DISPLAY_OUTPUT: true,
  SPAWN_DEPTH_LIMIT: 1
};

const displayConfig = {
  SPAWN_DISPLAY_OUTPUT: true,
  SPAWN_DEPTH_LIMIT: 0
};

const hiddenConfig = {
  SPAWN_DISPLAY_OUTPUT: false,
  SPAWN_DEPTH_LIMIT: 0
};

const limitConfig = {
  SPAWN_DISPLAY_OUTPUT: true,
  SPAWN_DEPTH_LIMIT: 2
};

// to avoid poluting the stdout, write stdout messages to a variable
const originalStdout = process.stdout.write;
function redirectStdout(messageHolder) {
  process.stdout.write = (chunk) => {
    messageHolder.message += chunk;
  };
}
function restoreStdout() {
  process.stdout.write = originalStdout;
}

/* -------------------------------------------------------
 * TESTS
 * ---------------------------------------------------- */

describe('Spawn', () => {

  // set by Starflow in a common case
  starflow.logger.depth = 0;

  it('Factory should provide an executable instance', () => {
    let spawnInstance = spawnFactoryWrapper(starflow, defaultConfig)();
    expect(typeof spawnInstance).to.equal('object');
    expect(typeof spawnInstance.exec).to.equal('function');
  });

  it('Name should be "shell.spawn"', () => {
    let spawnInstance = spawnFactoryWrapper(starflow, defaultConfig)();
    expect(spawnInstance.name).to.equal('shell.spawn');
  });

  describe('Config allows displaying the result in the stdout', () => {

    it('Result should be displayed', (done) => {
      let spawnInstance = spawnFactoryWrapper(starflow, displayConfig)();

      let messageHolder = {message: ''};
      redirectStdout(messageHolder);

      spawnInstance
        .exec('cat', path.resolve(__dirname, 'fixtures/simple.txt'))
        .then(() => {
          expect(messageHolder.message).to.equal(`${starflow.logger.formatLog(`Hello, World!${EOL}`)}${EOL}`);
          restoreStdout();
          done();
        });
    });

    it('Result should be stored in the output property of storage', (done) => {
      let spawnInstance = spawnFactoryWrapper(starflow, displayConfig)();

      let messageHolder = {message: ''};
      redirectStdout(messageHolder);

      spawnInstance
        .exec('cat', path.resolve(__dirname, 'fixtures/simple.txt'))
        .then(() => {
          expect(spawnInstance.storage.get('output')).to.equal(`Hello, World!${EOL}`);
          restoreStdout();
          done();
        });
    });

  });

  describe('Config doesn\'t allow displaying the result in the stdout', () => {

    it('Result should not be displayed, a warning should', (done) => {
      let spawnInstance = spawnFactoryWrapper(starflow, hiddenConfig)();

      let messageHolder = {message: ''};
      redirectStdout(messageHolder);

      spawnInstance
        .exec('cat', path.resolve(__dirname, 'fixtures/simple.txt'))
        .then(() => {
          expect(messageHolder.message).to.equal(`${starflow.logger.formatLog(`${chalk.yellow(WARNING_OUTPUT_MESSAGE)}`)}${EOL}`);
          restoreStdout();
          done();
        });
    });

    it('Result should not be displayed because limit is reached, a warning should', (done) => {
      let spawnInstance = spawnFactoryWrapper(starflow, limitConfig)();

      let messageHolder = {message: ''};
      redirectStdout(messageHolder);
      let originalDepth = starflow.logger.depth;
      starflow.logger.depth = limitConfig.SPAWN_DEPTH_LIMIT + 1;

      spawnInstance
        .exec('cat', path.resolve(__dirname, 'fixtures/simple.txt'))
        .then(() => {
          expect(messageHolder.message).to.equal(`${starflow.logger.formatLog(`${chalk.yellow(WARNING_OUTPUT_MESSAGE)}`)}${EOL}`);
          restoreStdout();
          starflow.logger.depth = originalDepth;
          done();
        });
    });

    it('Result should be stored in the output property of storage', (done) => {
      let spawnInstance = spawnFactoryWrapper(starflow, defaultConfig)();

      let messageHolder = {message: ''};
      redirectStdout(messageHolder);

      spawnInstance
        .exec('cat', path.resolve(__dirname, 'fixtures/simple.txt'))
        .then(() => {
          expect(spawnInstance.storage.get('output')).to.equal(`Hello, World!${EOL}`);
          restoreStdout();
          done();
        });
    });

  });

});
