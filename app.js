
/**
 * Module dependencies.
 */

var express = require('express')
  , partials = require('express-partials')
  , http = require('http')
  , path = require('path')
  , routes = require('./lib/routes');
config = require('./config');
app = express();
var dateFormat = require('./lib/dateformat.js');

function authorize(username,password){
  return config.admin.username === username && config.admin.password === password;
}

function authorize(req,res,next){
  var username=req.session.username;
  var password=req.session.password;
  if(username==config.admin.username&&password==config.admin.password) return  next();
  else  return res.redirect('login');
}

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(partials());
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser(config.options.cookie_secret));
  app.use(express.session());
  app.use(function(req, res, next){
    var username=req.session.username;
    var password=req.session.password;
    var login=(username==config.admin.username&&password==config.admin.password);
    res.locals({
      login:login,
      url:req.url
    });
    app.locals.url=req.url;
    next();
  })
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.locals.title = '';
app.locals.dateFormat = dateFormat;

app.get('/', routes.index);
app.get('/page/:page', routes.index);
app.get('/login',routes.login);
app.post('/login',routes.checkLogin)
app.get('/logout', routes.logout);
app.get('/settings',authorize, routes.settings);
app.post('/settings', routes.saveSettings);
app.get('/new',authorize, routes.editPost);
app.post('/new',authorize, routes.savePost);
app.get('/post/:slug', routes.post);
app.get('/post/:slug/edit',authorize, routes.editPost);
app.post('/post/:slug/edit',authorize, routes.savePost);
app.all('/post/:slug/delete',authorize, routes.deletePost);
app.get('/:slug', routes.page);
app.get('/:slug/edit',authorize, routes.editPost);
app.post('/:slug/edit',authorize, routes.savePost);
app.all('/:slug/delete',authorize, routes.deletePost);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
