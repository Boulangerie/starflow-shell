module.exports = function (starflow) {

  var _ = require('lodash');

  var config = {
    SPAWN_DISPLAY_OUTPUT: _.includes(['true', '1', 'on', 'yes'], starflow.config.get('shell.SPAWN_DISPLAY_OUTPUT', '1').toLowerCase()),
    SPAWN_DEPTH_LIMIT: parseInt(starflow.config.get('shell.SPAWN_DEPTH_LIMIT', 1), 10)
  };

  return {
    factories: {
      spawn: require('./lib/spawn').default(starflow, config)
    }
  };

};
