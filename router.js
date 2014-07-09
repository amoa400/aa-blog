import post from './controllers/post';
import admin from './controllers/admin';

export default function(router) {

  // 管理
  router.use('/signin', admin.signin);
  router.use('/signin-do', admin.signinDo);
  router.use('/signout', admin.signout);
  router.use('/create', admin.create);
  router.use('/create-do', admin.createDo);
  router.use('/edit/:alias', admin.create);

  // 文章显示
  router.get('/p/:alias', post.show);

  // 文章列表
  router.use('/keyword/:keyword/page/:page', post.list);
  router.use('/page/:page', post.list);
  router.use('/', post.list);

  return router;
}

