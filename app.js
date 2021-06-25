const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const catalogRouter = require('./routes/catalog'); //导入catalog路由


const app = express();
const mongoose = require('mongoose');
const mongoDB = 'mongodb+srv://huyu:huyu362203@cluster0.frh1x.mongodb.net/MONGODB02?retryWrites=true&w=majority';

mongoose.connect(mongoDB,{useNewUrlParser:true,useFindAndModify:true,useUnifiedTopology: true});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error',console.error.bind(console,'MongoDB连接错误：'))

// view engine setup
app.set('views', path.join(__dirname, 'views'));//在当前目录下的，views子目录中寻找模板
app.set('view engine', 'pug');//模板引擎为pug

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog',catalogRouter); //将catalog路由添加进中间件

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler,错误处理器152
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
