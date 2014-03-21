var func = require('../function');
var async = require('async');
var aamysql = require('aa-mysql');
var moment = require('moment');
var markdown = require('markdown').markdown;

exports.list = function(req, res) {
  var param = {};
  if (req.params.length == 1) {
    param.page = req.params[0];
  }
  if (req.params.length == 2) {
    param.keyword = req.params[0];
    param.page = req.params[1];
  }

  var page = 1;
  var pageNum = 10;
  if (!!param.page)
    page = parseInt(param.page);

  var whereStr = '';
  if (!!param.keyword) {
    var keyword = aamysql.escape(param.keyword);
    keyword = '\'%' + keyword.substr(1, keyword.length - 2) + '%\'';
    whereStr += '`title` LIKE ' + keyword + '';
    whereStr += ' OR ';
    whereStr += '`content` LIKE ' + keyword + '';
  }

  async.parallel([
    function(cb) {
      aamysql.table('aa_config').where({key: 'adminUser'}).find(function(err, row) {
        cb(err, row);
      });
    },
    function(cb) {
      aamysql.table('aa_post').field(['COUNT(*) AS count']).where(whereStr).find(function(err, row) {
        cb(err, row);
      });
    },
    function (cb) {
      aamysql.table('aa_post').field(['id', 'alias', 'title', 'abstract', 'create_time', 'view_count']).where(whereStr).limit((page - 1) * pageNum, pageNum).select(function(err, row) {
        cb(err, row);
      });
    }
  ], function(err, data) {
    if (err) {
      console.log(err);
      res.redirect('/');
      return;
    }
    var posts = data[2];
    for (var i = 0; i < posts.length; i++) {
      posts[i] = exports.format(posts[i]);
    }
    res.render('list', {
      pageTitle: 'index-aa-blog',
      posts: posts,
      username: data[0].value,
      cntPage: page,
      totPage: parseInt((data[1].count - 1) / pageNum) + 1,
      count: data[1].count,
      keyword: param.keyword
    });
  });
}

exports.show = function(req, res) {
  async.parallel([
    function(cb) {
      aamysql.table('aa_config').where({key: 'adminUser'}).find(function(err, row) {
        cb(err, row);
      });
    },
    function(cb) {
      aamysql.table('aa_post').where({alias: req.params.alias}).find(function(err, row) {
        cb(err, row);
      });
    }
  ], function(err, data) {
    if (err || !data[1]) {
      console.log(err);
      res.redirect('/');
      return;
    }

    var post = exports.format(data[1]);
    res.render('show', {
      pageTitle: post.title, 
      post: post, 
      username: data[0].value
    });

    aamysql.table('aa_post').where({id: post.id}).update('view_count = view_count + 1');
  });
}

exports.format = function(doc) {
  if (!!doc.abstract)
    doc.abstract = markdown.toHTML(doc.abstract);
  if (!!doc.content)
    doc.content = markdown.toHTML(doc.content.replace('<!--more-->', ''));
  doc.create_time_f = moment(doc.create_time).format('YYYY-MM-DD');
  return doc;
}

