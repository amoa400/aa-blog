var traceur = require('traceur');

traceur.require.makeDefault(function(path) {
  return path.indexOf('node_modules') == -1;
});

var run = require('./worker');
