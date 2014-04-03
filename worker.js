var config = require('./config');
var func = require('./function');
var express = require('express');
var ejs = require('ejs');
var aamysql = require('aa-mysql');
var app = express();

// 环境变量
app.set('port', process.env.PORT || config.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// production
//app.set('env', 'production');
//process.env.NODE_ENV = 'production';

// 中间件
app.use(express.logger('dev'));
app.use(express.compress());
app.use(express.timeout(10000));
app.use(express.static(__dirname + '/public'));
app.use(express.favicon(__dirname + '/public/favicon.ico'));
app.use(express.cookieParser());
app.use(express.session({
  cookie: {maxAge: 20 * 60 * 1000},
  secret: config.sessionSecret
}));
app.use(express.bodyParser());
app.use(express.methodOverride());
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

// 模板变量
app.locals({
  Loader: require('loader'),
  assetsMap: require('./public/assets.json')
});

// 数据库连接
aamysql.config({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  pass: config.db.pass
});
aamysql.connect(function(err) {
  if (err) {
    console.log(err);
    process.exit(0);
  }
  aamysql.use(config.db.name);

  // 获取配置信息
  aamysql.table('aa_config').select(function(err, rows) {
    if (err) {
      console.log(err);
      return;
    }
    for (var i = 0; i < rows.length; i++) {
      if (func.inArray(rows[i].key, ['blogTitle', 'blogSlogan', 'renren', 'weibo', 'twitter', 'facebook', 'mail', 'beian'])) {
        app.locals[rows[i].key] = rows[i].value;
      }
    }
  });
});

// 创建HTTP服务器
app.listen(app.get('port'), function() {
  console.log('worker listening on port ' + app.get('port'));
});

// 路由器
require('./route')(app);
