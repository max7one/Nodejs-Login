var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');

var path = require('path');
var user = require('./user');

var app = express();

// 设定模板
app.engine('hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs'
}));

//设定模板路径
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

//body解析
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());

app.use(session({
  secret: 'hubwizApp', //为了安全性的考虑设置secret属性
  cookie: {
    maxAge: 60 * 1000 * 30
  }, //设置过期时间
  resave: true, // 即使 session 没有被修改，也保存 session 值，默认为 true
  saveUninitialized: false, //
}));

app.get('/', function(req, res) {
  if (req.session.sign) { //检查用户是否已经登录，如果已登录展现的页面
    console.log(req.session); //打印session的值
    res.render('sign', {
      session: req.session
    });
  } else { //否则展示index页面
    res.render('index', {
      title: 'index'
    });
  }
});

//登录表单处理
app.post('/sign', function(req, res) {
  //登录的数据和user.json中的数据进行对比
  if (!user[req.body.user] || !user[req.body.user].password) {
    res.end('sign failure');
  } else {
    req.session.sign = true;
    req.session.name = user[req.body.user].name;
    res.send('welecome <strong>' + req.session.name + '</strong>，<a href="/out">登出</a>');
  }
});

app.get('/out', function(req, res) {
  req.session.destroy();
  res.redirect('/');
});

// 404 catch-all handler (middleware)
app.use(function(req, res, next) {
  res.status(404);
  res.render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(3000);
