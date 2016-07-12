# starflow-shell

## Prerequisites

In order to use this plugin, your project must have [starflow](http://github.com/boulangerie/starflow) as a dependency.

## Install

```
$ npm install --save-dev starflow-shell
```

## Usage

Using a workflow:

```js
var starflow = require('starflow');

var steps = [
  {'shell.spawn': ['git', 'rev-parse', '--abbrev-ref', 'HEAD']}
];

var workflow = new starflow.Workflow(steps);
return workflow
  .addPlugin(require('starflow-shell'))
  .run();
```

In an executable:

```js
module.exports = function (starflow) {
  var spawnFactory = require('starflow-shell').factories.spawn;

  function MyExecutable() {
    starflow.BaseExecutable.call(this, 'myPlugin.myExecutable');
  }
  MyExecutable.prototype = Object.create(starflow.BaseExecutable.prototype);
  MyExecutable.prototype.constructor = MyExecutable;

  MyExecutable.prototype.exec = function exec() {
    var spawnExecutable = this.createExecutable(spawnFactory);
    return new starflow.Task(spawnExecutable, ['git', 'rev-parse', '--abrev-ref', 'HEAD'])
      .run()
      .then(function () {
        var currentBranch = this.storage.get('shell.spawn/output');
        // useless because the spawn executable already displays the branch name 
        // if it's not muted by config (see Config section down below)
        // but let's do it for the purpose of this example
        starflow.logger.log('Current git branch: ' + currentBranch);
      }.bind(this));
  };

  return function () {
    return new MyExecutable();
  };
};
```

## Executables

Thereafter is the list of all the executable classes provided by this plugin.

> **Important** The titles indicate the name that can be used when writing the steps of a workflow.

### shell.spawn

Perform any kind of command you would do in a terminal.

Usage:
```js
// for a workflow
var steps = [
  {'shell.spawn': ['commandName', 'arg1', 'arg2']}
];

// in an executable
var spawnFactory = require('starflow-shell').factories.spawn;

// either using an array
var myTask = new starflow.Task(spawnFactory, ['commandName', 'arg1', 'arg2']);
// or an object
var myTask = new starflow.Task(spawnFactory, {
  cmd: 'commandName',
  args: ['arg1', 'arg2']//,
  // muteErrors: true, // if you don't want the errors to break the workflow execution
  // options: {stdio: 'ignore'} // options you would pass to require('child_process').spawn
});
```

## Config

Some behaviors of this plugin depend on the values of config variables, here's the list of them and their effect.

- **SPAWN_DISPLAY_OUTPUT** (default value: `true`) Display the output of the spawn command in the workflow logs.
- **SPAWN_DEPTH_LIMIT** (default value: `1`) Set a workflow logs depth limit from where the output is shut.

You can set these config variable from several ways:

- Env variables on your machine.
  
  Example (assuming `index.js` contains your workflow that uses the _shell.spawn_ executable):
  
  ```
  $ starflow_shell__SPAWN_DISPLAY_OUTPUT=1 starflow_shell__SPAWN_DEPTH_LIMIT=3 node index.js 
  ```

- `.starflowrc` file at the root of your project.

  Example:

  ```json
  {
    "shell": {
      "SPAWN_DISPLAY_OUTPUT": true,
      "SPAWN_DEPTH_LIMIT": 3
    }
  }
  ```

Internally, Starflow uses the [rc module](https://github.com/dominictarr/rc) to handle the config values.

## Storage

Some of the executables of this plugin store some values in their storage.

### shell.spawn

- **output** Contains the output of the `spawn` command as a string value.

  Example:

  ```js
  var starflow = require('starflow');

  var steps = [
    {'shell.spawn': ['git', 'rev-parse', '--abbrev-ref', 'HEAD']},
    {'custom.echo': '{{/shell.spawn/output}}'} // displays the current git branch name
  ];

  var workflow = new starflow.Workflow(steps);
  return workflow
    .addPlugin(require('starflow-shell'))
    .addPlugin(require('starflow-custom')) // plugin that contains the 'echo' executable
    .run();
  ```

  > **Note:** learn more about storage paths on the [Starflow documentation page](http://github.com/boulangerie/starflow/blob/master/docs/API.md#path-format).

## Contributing

If you want to contribute to this project, here are the few commands you should know.

### Build the project

```
$ npm run build
```

### Run the tests

```
$ npm test
```

In addition, please take the time to update this README file with the new executables/API brought by your contribution. Thank you! :heart:
