const express = require('express');
require('dotenv').config();
// require('dotenv').config({ path: './config/config.env' });
const mainRoute = require('./routes/mainRoute');
const errorMiddleware = require('./middleware/error');
const fileUpload = require('express-fileupload');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const cookieParser = require('cookie-parser');

//Handling uncaught Exception
process.on('uncaughtException', (err) => {
  process.exit(1);
});

const connectionDatabase = require('./config/database');
//connection to database
connectionDatabase();

//Set up body parser
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

//setup security headers
app.use(helmet());

//setup body parser
app.use(express.json());

//set cookie parser
app.use(cookieParser());

//handle file uploads
app.use(fileUpload());

//sanitize data
app.use(mongoSanitize());

//Prevent XSS attacks
app.use(xssClean());

//Prevent parameter pollution.  Example we can add two parameter 'positions'
app.use(hpp({ whitelist: ['positions'] }));

//rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, //10 minutes
  max: 100,
});

app.use(limiter);

//setup CORS - accessible by other domains
app.use(cors());

// //creating own middleware
// const middleware = (req, res, next) => {
//   console.log('Hello from middleware');
//   //sett up user globaly
//   req.user = 'Mano Chao';
//   req.requestMethod = req.url;
//   next();
// };

// app.use(middleware);
app.use(mainRoute);

//Middleware to handle errors
app.use(errorMiddleware);

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  console.log(
    'Server started on port',
    PORT,
    'in',
    process.env.NODE_ENV.toLocaleUpperCase(),
    'mode'
  );
});

//handling Unhandled Promise Rejection

process.on('unhandledRejection', (err) => {
  console.log('Error02:', err.message);
  console.log('Shutting down the server due to Unhandled promise rejection');
  server.close(() => {
    process.exitCode(1);
  });
});
