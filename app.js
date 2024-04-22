var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var multer = require('multer')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var questionsRouter = require('./routes/questions');
var answersRouter = require('./routes/answers');

var app = express();

app.use(express.static('public'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

require('dotenv').config();
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/Express"; // Sprememba tukaj
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB Local');
})
.catch((err) => {
  console.error('Error connecting to MongoDB Local:', err);
});


var session = require('express-session');
var MongoStore = require('connect-mongo');
const { error } = require('console');
const userController = require('./controllers/userController');
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: MongoStore.create({mongoUrl: MONGODB_URI})
}));

app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/questions', questionsRouter);
app.use('/answers', answersRouter);


// profile pictures setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/profile_pictures/users");
  },
  filename: (req, file, cb) => {
    console.log(file);
    var date = Date.now();
    file.newName = date + path.extname(file.originalname);
    cb(null, date + path.extname(file.originalname));
  }
})
const upload = multer({storage: storage})
app.post("/uploadImage", upload.single("profile_picture"), userController.uploadProfilePicture);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

module.exports = app;