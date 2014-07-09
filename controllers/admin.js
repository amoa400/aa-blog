import crypto from '../wine/crypto';

class Controller {
};
var controller = new Controller();
export default controller;

Controller.prototype.signin = function(req, res) {
  res.render('signin', {pageTitle: 'signin'});
}
Controller.prototype.signinDo = function(req, res) {
  run(controller._signinDo, req, res);
}
Controller.prototype._signinDo = function(req, res, resume) {
  if (req.body.username === config.username && crypto.createHash('sha1').update(req.body.password).digest('hex') === config.password) {
    req.session.signed = true;
    req.session.username = req.body.username;
    res.redirect('/');
    return;
  }

  res.redirect('/signin');
}

Controller.prototype.signout = function(req, res) {
  for (var i in req.session) {
    if (i != 'cookie')
      delete req.session[i];
  }
  res.redirect('/');
}

Controller.prototype.create = function(req, res) {
  run(controller._create, req, res);
}
Controller.prototype._create = function*(req, res, resume) {
  if (!req.session.signed) {
    res.redirect('/');
    return;
  }

  var post = {id: '', alias: '', title: '', content: ''};
  if (req.params.alias) {
    var err = '';
    [err, post] = yield pool.run({
      table: 'post',
      where: [{alias: req.params.alias}],
      method: 'find'
    }, resume);
    if (err || !post)
      post = {id: '', alias: '', title: '', content: ''};
  }

  res.render('save', {pageTitle: 'create', post: post});
}

Controller.prototype.createDo = function(req, res) {
  run(controller._createDo, req, res);
}
Controller.prototype._createDo = function*(req, res, resume) {
  if (!req.session.signed) {
    res.redirect('/');
    return;
  }

  var data = {
    alias: req.body.alias,
    title: req.body.title,
    content: req.body.content,
    create_time: func.getTime(),
    view_count: 0
  };
  var moreW = req.body.content.indexOf('<!--more-->');
  if (moreW != -1)
    data.abstract = req.body.content.substr(0, moreW);
  else
    data.abstract = data.content;

  if (req.body.id) {
    delete data.create_time;
    delete data.view_count;
    pool.run({
      table: 'post',
      data: data,
      where: [{id: req.body.id}],
      method: 'update'
    });
  } else {
    pool.run({
      table: 'post',
      data: data,
      method: 'insert'
    });
  }

  res.redirect('/p/' + req.body.alias);
}
