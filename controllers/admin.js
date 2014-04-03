var func = require('../function');
var async = require('async');
var aamysql = require('aa-mysql');
var crypto = require('crypto');

exports.signin = function(req, res) {
  res.render('signin', {pageTitle: 'signin'});
}

exports.signinDo = function(req, res) {
  async.series([
    function(cb) {
      aamysql.table('aa_config').where({key: 'adminUser'}).find(function(err, row) {
        cb(err, row);
      });
    },
    function(cb) {
      aamysql.table('aa_config').where({key: 'adminPass'}).find(function(err, row) {
        cb(err, row);
      });
    }
  ], function(err, data) {
    if (err) {
      console.log(err);
      res.redirect('/admin/signin');
      return;
    }
    if (req.body.username === data[0].value && crypto.createHash('sha1').update(req.body.password).digest('hex') === data[1].value) {
      req.session.signed = true;
      req.session.username = req.body.username;
      res.redirect('/');
    } else {
      res.redirect('/admin/signin');
    }
  });
}

exports.signout = function(req, res) {
  for (var i in req.session) {
    if (i != 'cookie')
      delete req.session[i];
  }
  res.redirect('/');
}

exports.create = function(req, res) {
  if (!req.session.signed) {
    res.redirect('/');
    return;
  }
  aamysql.table('aa_post').where({alias: req.params['alias']}).find(function(err, row) {
    var post = row || {id: '', alias: '', title: '', content: ''};
    res.render('save', {pageTitle: 'create', post: post});
  });
}

exports.createDo = function(req, res) {
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
  // TODO: 正确性检查

  if (req.body.id) {
    delete data.create_time;
    delete data.view_count;
    aamysql.table('aa_post').where({id: req.body.id}).update(data, function(err, ret) {
      if (err) {
        res.redirect('/admin/create');
        return;
      }
      res.redirect('/p/' + req.body.alias);
    });
  } else {
    aamysql.table('aa_post').insert(data, function(err, ret) {
      if (err) {
        res.redirect('/admin/create');
        return;
      }
      res.redirect('/p/' + req.body.alias);
    });
  }
}

exports.install = function(req, res) {
  res.render('install', {pageTitle: 'install'});
}

exports.installDo = function(req, res) {
  var obj = {};
  mongoose.model('config').find({key: 'installed'}, function(err, docs) {
    if (err || docs.length != 0) {
      res.redirect('/');
      return;
    }

    obj.blogTitle = req.body.blogTitle;
    obj.blogSlogan = req.body.blogSlogan;
    obj.username = req.body.username;
    obj.password = req.body.password;
    obj.installed = 1;
    if (!obj.blogTitle || !obj.blogSlogan || !obj.username || !obj.password) {
      res.redirect('/install/');
      return;
    }

    mongoose.model('config').create({key: 'blogTitle', value: obj.blogTitle});
    mongoose.model('config').create({key: 'blogSlogan', value: obj.blogSlogan});
    mongoose.model('config').create({key: 'admin', username: obj.username, password: crypto.createHash('sha1').update(obj.password).digest('hex')});

    res.redirect('/');
  });
}