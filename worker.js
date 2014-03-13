var config = require('./config');
var express = require('express');
var ejs = require('ejs');
var mongoose = require('mongoose');
var app = express();

// environments
app.set('port', process.env.PORT || config.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
// app.set('env', 'production');
app.engine('html', require('ejs').renderFile);

// middleware
app.use(express.logger('dev'));
app.use(express.compress());
app.use(express.cookieParser());
app.use(express.session({
  cookie: {maxAge: 20 * 60 * 1000},
  secret: config.sessionSecret,
  store: new require('session-mongoose')(express)({
    url: 'mongodb://' + config.db.host + '/' + config.db.name,
    interval: 120000
  })
}));
app.use(express.timeout(10000));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(__dirname + '/public'));
app.use(express.favicon(__dirname + '/public/favicon.ico'));
app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});
app.use(app.router);

if (app.get('env') == 'development') {
  app.use(express.errorHandler());
}
else {
  app.use(function(err, req, res, next) {
    if (err) {
      console.log(err.stack);
      res.end('error ' + err.status);
      next(err);
    }
    else
      next();
  });
}

// local
app.locals({
  blogTitle: config.name,
  blogSlogan: config.slogan,
  loader: require('loader')
});

// mongodb
mongoose.connect('mongodb://' + config.db.host + ':' + config.db.port + '/' + config.db.name,
  function(err) {
    if (err) {
      console.log(err);
      process.exit();
    }
    mongoose.model('config', new mongoose.Schema({}, {strict: false})).find(function(err, docs) {
      if (err) {
        console.log(err);
        return;
      }
      for (var i = 0; i < docs.length; i++) {
        var doc = docs[i].toObject();
        switch (doc.key) {
          case 'blogTitle':
            app.locals.blogTitle = doc.value;
            break;
          case 'blogSlogan':
            app.locals.blogSlogan = doc.value;
            break;
          case 'renren':
            app.locals.renren = doc.value;
            break;
          case 'weibo':
            app.locals.weibo = doc.value;
            break;
          case 'twitter':
            app.locals.twitter = doc.value;
            break;
          case 'facebook':
            app.locals.facebook = doc.value;
            break;
          case 'mail':
            app.locals.mail = doc.value;
            break;
        }

      }
    });
  }
);

// create server
app.listen(app.get('port'), function() {
  console.log('worker listening on port ' + app.get('port'));
});

// router
require('./route')(app);
