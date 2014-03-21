var post = require('./controllers/post');
var admin = require('./controllers/admin');
var route = module.exports = function(app) {

  app.get(/^\/(?:page\/(\d*)\/)?$/, post.list);
  app.get(/^\/keyword\/(\S*)\/page\/(\d*)\/$/, post.list);

  app.get('/p/:alias', post.show);

  app.get('/admin/signin', admin.signin);
  app.post('/admin/signinDo', admin.signinDo);
  app.get('/admin/signout', admin.signout);

  app.get('/admin/create', admin.create);
  app.post('/admin/createDo', admin.createDo);

  app.get('*', function(req, res) {
    res.redirect('/');
  });

/*
  app.get('/install/', admin.install);
  app.post('/install_do/', admin.installDo);
*/
}

