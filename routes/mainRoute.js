const express = require('express');
const ErrorHandler = require('../utils/errorHandler');

const jobs = require('./jobs');
const auth = require('./auth');
const user = require('./user');

const router = express.Router();

router.use('/api/v1', jobs);
router.use('/api/v1', auth);
router.use('/api/v1', user);

//Handle unhandled routes
router.all('*', (req, res, next) => {
  next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
});

module.exports = router;
