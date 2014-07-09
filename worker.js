import express from './wine/express';
import ejs from './wine/ejs';
import mid from './wine/middleware';
import colors from './wine/colors'
import util from './wine/util';
import db from './wine/aa-mysql';
import loader from './wine/loader';
import assets from './wine/assets';

import config from './config';
import func from './function';
import router from './router';

// 启动express
var app = express();
var eRouter = express.Router();

// 环境变量
app.set('port', config.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

app.set('env', 'production');
process.env.NODE_ENV = 'production';

// 中间件
app.use(mid.compression());
app.use(mid.serveStatic(__dirname + '/public'));
app.use(mid.timeout(10000));
app.use(mid.morgan('dev'));
app.use(mid.bodyParser());
app.use(mid.multipart({
  uploadDir: __dirname + '/public/upload',
  maxFilesSize: 15 * 1024 * 1024
}));
app.use(mid.cookieParser(config.secret));
app.use(mid.session({secret: config.secret}));
app.use(mid.methodOverride());
app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});
app.use(router(eRouter));

// 错误监听
app.use(function(err, req, res, next){
  if (typeof err == 'object' && err.status)
    res.send(err.status, err.toString());
  else
    res.send(err);
});

// 模板变量
app.locals.config = config;
app.locals.Loader = loader;
app.locals.assetsMap = assets;

// 全局变量
global.log = util.log;
global.config = config;
global.func = func;
global.run = func.run;

global.pool = db.create();
pool.config({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  pass: config.db.pass,
  db: config.db.name,
  prefix: config.db.prefix
});

// 监听
app.listen(app.get('port'), function() {
  log(('server listen on port ' + app.get('port')).green);
});

// 全局错误
process.on('uncaughtException', function (err) {
  console.log('error in process:');
  console.log(err);
});


