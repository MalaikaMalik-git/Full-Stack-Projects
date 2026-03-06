const express = require('express');
const morgan = require('morgan');
const app = express();
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const path = require('path');
const cookieParser = require('cookie-parser');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// serving static files
//app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// Global MIDDLEWARES
// set security http headers

app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        'https://unpkg.com',
        'https://cdnjs.cloudflare.com',
        'https://cdn.jsdelivr.net',
      ],
      styleSrc: [
        "'self'",
        'https://unpkg.com',
        'https://fonts.googleapis.com',
        "'unsafe-inline'",
      ],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://*'],
      connectSrc: [
        "'self'",
        'https://unpkg.com',
        'https://cdn.jsdelivr.net',
        'http://127.0.0.1:8000',
        'ws://127.0.0.1:*', // ✅ allow Parcel HMR websockets on any port
        'ws://localhost:*', // ✅ also allow localhost for consistency
      ],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// this is used for limitng rate of same ips
const limiter = rateLimit({
  // this allows 100 requests for one hour from the same ip
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});
app.use('/api', limiter);

//body parse ,reading data from body into re.body
app.use(
  express.json({
    // body larger than 10kb will not be accepted
    limit: '10kb',
  })
);
app.use(cookieParser());
// data sanitization against NOSQL query injection
// it will look at body,query,params and remove any $ signs and dots remeberemail: {$gt=""} which will select all emails
app.use(mongoSanitize());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// data sanitization against XSS
//if hacker will inject some malicious html code or javscript code it will prevent it
app.use(xss());

// prevent parameters pollution
// remove deuplicate ones and take the last one
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  //express will understand that this is error and it moves it to error handling middleware automatically
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
