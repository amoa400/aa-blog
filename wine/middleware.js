export default {
  timeout: require('connect-timeout'),
  morgan: require('morgan'),
  compression: require('compression'),
  serveStatic: require('serve-static'),
  bodyParser: require('body-parser'),
  cookieParser: require('cookie-parser'),
  session: require('express-session'),
  methodOverride: require('method-override'),
  multipart: require('connect-multiparty')
} 
