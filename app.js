var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var mongoose = require('mongoose');
// connect to mongo db
mongoose.connect('mongodb://localhost/pocketdesk', { useMongoClient: true });

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('openUri', function() {
   console.log('we are connected');
});

var app = express();

// CORS on ExpressJS

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// app.get('/login', function(req, res) {
// console.log('sdsd');
//     //res.send([{name:'wine1'}, {name:'wine2'}]);
// });

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({
  limit: '50mb'
}));
app.use(bodyParser.urlencoded({extended: false  }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var apiinit = require('./routes/apiinit');
apiinit(app);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
// process
//  .on('unhandledRejection', (reason, p) => {
//    console.error(reason, 'Unhandled Rejection at Promise', p);
//  })
//  .on('uncaughtException', err => {
//    console.error(err, 'Uncaught Exception thrown');
//   // process.exit(1);
//  });
module.exports = app;
