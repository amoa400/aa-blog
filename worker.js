var config = require('./config');
var express = require('express');
var ejs = require('ejs');
var app = express();

// environments
app.set('port', process.env.PORT || config.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
//app.set('env', 'production');
app.engine('html', require('ejs').renderFile);

// middleware
app.use(express.logger('dev'));
app.use(express.compress());
app.use(express.timeout(10000));
app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(express.static(__dirname + '/public'));
app.use(express.favicon(__dirname + '/public/favicon.ico'));
app.use(app.router);

if (app.get('env') == 'development') {
  app.use(express.errorHandler());
} 
else {
  app.use(function(err, req, res, next) {
    if (err) {
      console.log(err.stack);
      res.end('error ' + err.status);
    }
    next();
  });
}

// local
// TODO

// create server
app.listen(app.get('port'), function() {
  console.log('worker listening on port ' + app.get('port'));
});

// router
require('./route')(app);
