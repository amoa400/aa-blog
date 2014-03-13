var mongoose = require('mongoose');
var moment = require('moment');
var markdown = require('markdown').markdown;

require('../models/article');
var article = mongoose.model('Article');

exports.list = function(req, res) {
  var filter = {};
  if (req.params.length == 1) {
    filter.page = req.params[0];
  }
  if (req.params.length == 2) {
    filter.keyword = req.params[0];
    filter.page = req.params[1];
  }

  mongoose.model('config').findOne({key: 'admin'}, function(err, admin) {
    if (err || !admin) {
      res.redirect('/');
      return;
    }

    var page = 1;
    if (filter.page)
     page = parseInt(filter.page);
  
    var artFilter = {};
    if (filter.keyword != null) {
      var keyword = '';
      var escapeStr = '$()*+.[]?\\^{}|';
      for (var i = 0; i < filter.keyword.length; i++) {
        var flag = false;
        for (var j = 0; j < escapeStr.length; j++)
        if (filter.keyword[i] == escapeStr[j]) {
          flag = true;
          break;
        }
        if (flag)
          keyword += '\\';
        keyword += filter.keyword[i];
      }
      artFilter['$or'] = [
        {title: new RegExp(keyword, 'i')},
        {content: new RegExp(keyword, 'i')},
      ];
    }

    article.count(artFilter, function(err, num) {
      if (err) {
        res.redirect('/');
        return;
      }

      var totItem = 10;
      var totPage = parseInt((num - 1) / totItem) + 1;
      if (page <= 0)
        page = 1;
      if (page > totPage)
        page = totPage;
      article.find(artFilter, {comment: 0, content: 0}).sort({_id: -1}).
        skip((page - 1) * totItem).limit(totItem).exec(function(err, docs) {
        if (err) {
          res.redirect('/');
          return;
        }
        for (var i = 0; i < docs.length; i++) {
          docs[i] = exports.format(docs[i].toObject());
        }
        res.render('list', {
          pageTitle: 'index-aa-blog', 
          articles: docs,
          username: admin.toObject().username,
          totPage: totPage,
          cntPage: page,
          num: num,
          filter: filter
        });
      });
    });
  });
}

exports.show = function(req, res) {
  mongoose.model('config').findOne({key: 'admin'}, function(err, admin) {
    if (err || !admin) {
        res.redirect('/');
        return;
    }
    article.findOne({alias: req.params.alias}, function(err, doc) {
      if (err || !doc) {
        res.redirect('/');
        return;
      }
      doc = exports.format(doc.toObject());
      res.render('show', {
        pageTitle: doc.title, 
        article: doc, 
        username: admin.toObject().username
      });

      article.update({_id: doc._id}, {$inc: {view_count: 1}}).exec();
    });
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

