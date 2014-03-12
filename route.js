var article = require('./controllers/article');
var admin = require('./controllers/admin');

var route = module.exports = function(app) {
  app.get('*', function(req, res, next) {
    next();
  });

  app.get(/^\/(?:page\/(\d*)\/)?$/, article.list);
  app.get(/^\/keyword\/(\S*)\/page\/(\d*)\/$/, article.list);

  app.get('/signin/', admin.signin);
  app.post('/signinDo/', admin.signinDo);
  app.get('/signout/', admin.signout);

  app.get('/create/', admin.create);
  app.post('/createDo/', admin.createDo);

  app.get('/a/:alias/', article.show);
}

