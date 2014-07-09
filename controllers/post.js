import markdown from '../wine/markdown';
import moment from '../wine/moment';

class Controller {
};
var controller = new Controller();
export default controller;

Controller.prototype.list = function(req, res) {
  run(controller._list, req, res);
}
Controller.prototype._list = function*(req, res, resume) {
  // 获取关键词
  var where = [];
  if (req.params.keyword) {
    where = [
      {title: ['%' + req.params.keyword + '%', 'LIKE', false]}, 
      {content: ['%' + req.params.keyword + '%', 'LIKE', false]}, 
      'OR'
    ];
  }

  // 获取页数
  var page = 1;
  var pageNum = 10;
  if (req.params.page)
    page = parseInt(req.params.page);
  
  // 定义变量 
  var err = '';
  var count = '';
  var post = '';

  // 获取统计数据
  [err, count] = yield pool.run({
    table: 'post',
    field: [['COUNT(*) AS `count`']],
    where: where,
    method: 'find'
  }, resume);
  if (err) {
    res.redirect('/');
    return;
  }

  // 获取数据
  [err, post] = yield pool.run({
    table: 'post',
    where: where,
    order: [['id', 'DESC']],
    page: [page, pageNum],
    method: 'select'
  }, resume);
  if (err) {
    res.redirect('/');
    return;
  }

  for (var i = 0; i < post.length; i++) {
    post[i] = controller.format(post[i]);
  }

  res.render('list', {
    pageTitle: 'index-aa-blog',
    posts: post,
    cntPage: page,
    totPage: parseInt((count.count - 1) / pageNum) + 1,
    count: count.count,
    keyword: req.params.keyword
  });
}

Controller.prototype.show = function(req, res) {
  run(controller._show, req, res);
}
Controller.prototype._show = function*(req, res, resume) {
  var err = '';
  var post = '';

  [err, post] = yield pool.run({
    table: 'post',
    where: [{alias: req.params.alias}],
    method: 'find'
  }, resume);
  if (err) {
    res.redirect('/');
    return;
  }

  var conn = {};
  [err, conn] = yield pool.get(resume);
  [err, err] = yield conn.query('UPDATE `aa_post` SET `view_count` = `view_count` + 1 WHERE `id` = ' + post.id, resume);
  pool.release(conn);

  post = controller.format(post);

  res.render('show', {
    pageTitle: post.title, 
    post: post
  });
}

Controller.prototype.format = function(post) {
  if (post.abstract)
    post.abstract = markdown.toHTML(post.abstract);
  if (post.content)
    post.content = markdown.toHTML(post.content.replace('<!--more-->', ''));
  post.create_time = moment(post.create_time).format('YYYY-MM-DD HH:mm');
  return post;
}

