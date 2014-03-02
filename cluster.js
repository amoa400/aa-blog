var config = require('./config');
var cluster = require('cluster');

cluster.setupMaster({
  exec: 'worker.js'
});

var cpusLength = config.cpus || require('os').cpus().length;
for (var i = 0; i < cpusLength; i++) {
  cluster.fork();
}

cluster.on('exit', function(worker, code, signal) {
  var exitCode = worker.process.exitCode;
  console.log('worker PID:' + worker.process.pid + ' exited with CODE:' + exitCode + ', restarting..');
  cluster.fork();
});
