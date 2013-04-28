
/*
 * GET home page.
 */
var fs = require('fs');
var path = require('path');
var _=require('./underscore');
var dateFormat=require('./dateformat');
var Post = require('./post');
var posts = Post.loadPosts();
var pages = Post.loadPages();

exports.index = function(req, res){
  var postList=posts;
  var pager={};
  var page=1;
  if(req.params.page) page=parseInt(req.params.page);
  var category=req.query.category;
  if(category!=undefined)
    postList= _.filter(postList,function(post){return post.category==category});
  var tag=req.query.tag;
  if(tag!=undefined)
    postList= _.filter(postList,function(post){return _.contains(post.tags,tag);});
  pager.page=page;
  pager.total=postList.length;
  pager.size= config.options.postPagerSize;
  var pagePosts=postList.slice(pager.size*(pager.page-1),pager.size*pager.page);
  res.render('index', { title: 'posts',posts: pagePosts,pager:pager });
};

exports.post = function(req, res){
  var slug=req.params.slug;
  var previous,next;
  var post= _.find(posts,function(post){return post.slug==slug;});
  if(!post) return res.render('404',{layout:false});
  var idx= _.indexOf(posts,post);
  if(idx!=0)  next=posts[idx-1];
  if(idx!=(posts.length-1)) previous=posts[idx+1];
  res.render('post', { title: post.title,post: post,previous: previous,next: next });
};

exports.editPost = function(req, res){
  var slug=req.params.slug;
  if(!slug) {
    var slug=dateFormat(new Date(),'yyyy-mm-dd')+'_new-post';
    var markdown='# title \n'
    return res.render('post_edit', { title: 'posts', post:{slug: slug,markdown: markdown }});
  }
  var post= _.find(posts,function(post){return post.slug==slug;});
    if(!post) return res.render('404',{layout:false});
  res.render('post_edit', { title: 'posts', post:post});
};

exports.savePost = function(req, res){
  var slug=req.body.post.slug;
  var markdown=req.body.post.markdown;
  Post.save(slug,markdown);
  if(slug.indexOf('_')>0){
    posts=Post.loadPosts();
    return res.redirect('/post/'+slug);
  }
  pages=Post.loadPages();
  res.redirect('/'+slug);
};

exports.deletePost = function(req, res){
  var slug=req.params.slug;
  Post.delete(slug);
  if(slug.indexOf('_')>0) posts=Post.loadPosts();
  else  pages=Post.loadPages();
  res.redirect('/');
}

exports.page = function(req, res){
  var slug=req.params.slug;
  var post= _.find(pages,function(post){return post.slug==slug;});
  if(!post) return res.render('404',{layout:false});
  res.render('page', { title: post.title,post: post });
};

exports.login = function(req, res){
  res.render('login');
};

exports.checkLogin = function(req, res){
  var username=req.body.username;
  var password=req.body.password;
  if(username==config.admin.username&&password==config.admin.password){
    req.session.username=username;
    req.session.password=password;
    return res.redirect('/');
  }
  res.render('login',{title:'Login'});
};

exports.logout = function(req, res){
  req.session.username=null;
  req.session.password=null;
  res.redirect('/');
};

exports.settings = function(req, res){
  res.render('settings',{title:'Settings'});
};

exports.saveSettings = function(req, res){
  var content=req.body.content;
  config=JSON.parse(content);
  app.locals.config=config;
  content='module.exports = '+content;
  var configPath=path.resolve(__dirname,'../config.js');
  fs.writeFileSync(configPath,content,'utf-8');
  res.redirect('/');
}

exports.notfound = function(req, res){
  res.render('404');
};