var mongoose = require('mongoose');
var crypto = require('crypto');

require('../models/article');
var article = mongoose.model('Article');

exports.signin = function(req, res) {
  res.render('signin', {pageTitle: 'signin'});
}

exports.signinDo = function(req, res) {
  mongoose.model('config').find({key: 'admin'}, function(err, docs) {
    if (err || docs.length != 1) {
      res.redirect('/signin/');
      return;
    }
    var doc = docs[0].toObject();
    if (req.body.username === doc.username && crypto.createHash('sha1').update(req.body.password).digest('hex') === doc.password) {
      req.session.signed = true;
      req.session.username = req.body.username;
      res.redirect('/');
    } else {
      res.redirect('/signin/');
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
  res.render('save', {pageTitle: 'create'});
}

exports.createDo = function(req, res) {
  if (!req.session.signed) {
    res.redirect('/');
    return;
  }
  var doc = {
    alias: req.body.alias,
    title: req.body.title,
    content: req.body.content,
    abstract: req.body.content.sub(0, req.body.content.indexOf('<!--more-->'))
  };
  var moreIndex = req.body.content.indexOf('<!--more-->');
  if (moreIndex != -1)
    doc.abstract = req.body.content.substr(0, moreIndex);
  else
    doc.abstract = doc.content;
  // check
  article.create(doc, function(err, ret) {
    if (err) {
      res.redirect('/create/');
      return;
    }
    res.redirect('/a/' + req.body.alias + '/');
  });
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
    mongoose.model('config').create({key: 'admin', username: obj.username, password: obj.password});

    res.redirect('/');
  });
}