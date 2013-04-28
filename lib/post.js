var fs=require('fs');
var path=require('path');
var util=require('./util');
var _=require('./underscore');

var postsPath=path.resolve(__dirname,'../posts');
var pagesPath=path.resolve(__dirname,'../pages');
function getPostPath(slug){
  if(slug.indexOf('_')>0) return  path.join(postsPath,slug+'.md');
  return  path.join(pagesPath,slug+'.md');
}

var Post=function(slug){
  this.slug=slug;
  this.title=slug;
  this.page=slug.indexOf('_')==-1;
  if(!this.page){
    this.date=new Date(slug.split('_')[0]);
    this.category='';
    this.tags
  }
};

Post.prototype={
  get markdown(){
    var path=getPostPath(this.slug);
    var slug=this.slug;
    return fs.readFileSync(path,'utf-8');
  },
  get content(){
    var content=this.markdown;
    var patterns = {
      title: /\# *(.*) *(\r?\n)+/,
      category: /^> *category *: *(.*) *(\r?\n)+/,
      tags: /^> *tags *: *(.*) *(\r?\n)+/,
      status: /^> *status *: *(.*) *(\r?\n)+/
    };
    for(var item in patterns) content=content.replace(patterns[item],'');
    return util.markdown(content);
  },
  get summary(){
    var content=this.markdown;
    var patterns = {
      title: /\# *(.*) *(\r?\n)+/,
      category: /^> *category *: *(.*) *(\r?\n)+/,
      tags: /^> *tags *: *(.*) *(\r?\n)+/,
      status: /^> *status *: *(.*) *(\r?\n)+/
    };
    for(var item in patterns) content=content.replace(patterns[item],'');
    var len=content.length;
    var summary=content.substr(0,300);
    if(len>300) summary+=' …… ';
    return util.markdown(summary);
  }
};

Post.save=function(slug,markdown){
  fs.writeFileSync(getPostPath(slug),markdown,'utf-8');
}

Post.delete=function(slug){
  var path=getPostPath(slug);
  if(fs.existsSync(path))  fs.unlinkSync(getPostPath(slug));
}

Post.loadPosts=function(){
  var posts = [];
  var postFiles = fs.readdirSync(postsPath);
  postFiles.forEach(function(postFile){
    if(!/\.md$/.test(postFile)) return;
    var postPath = path.resolve(postsPath,postFile);
    var post=parsePost(postPath);
    posts.push(post);
  });
  posts= _.sortBy(posts,function(post){return -post.date;});
  return posts;
}

Post.loadPages=function(){
  var posts = [];
  var postFiles = fs.readdirSync(pagesPath);
  postFiles.forEach(function(postFile){
    if(!/\.md$/.test(postFile)) return;
    var postPath = path.resolve(pagesPath,postFile);
    var post=parsePost(postPath);
    posts.push(post);
  });
  return posts;
}

function parsePost(postPath){
  var patterns = {
    title: /\# *(.*) *(\r?\n)+/,
    category: /^> *category *: *(.*) *(\r?\n)+/,
    tags: /^> *tags *: *(.*) *(\r?\n)+/,
    status: /^> *status *: *(.*) *(\r?\n)+/
  };
  var basename=path.basename(postPath,'.md');
  var post=new Post(basename);
  var content=fs.readFileSync(postPath,'utf-8');
  for(var item in patterns){
    if(patterns.hasOwnProperty(item)){
      var result = content.match(patterns[item]);
      if(result){
        if(item=='tags')
          post[item] = result[1].replace(/ +/g,'').split(',');
        else
          post[item] = result[1];
        content = content.replace(patterns[item],'');
      }
    }
  }
  return post;
}

module.exports=Post;
