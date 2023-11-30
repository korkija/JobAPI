const crypto = require('crypto');
const User = require('../models/users');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const sentToken = require('../utils/jwtToken');
const sentEmail = require('../utils/sendEmail');

//Register a new user  = > /api/v1/register
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({ name, email, password, role });

  sentToken(user, 200, res);
  //   // create jwt token
  //   const token = user.getJwtToken();

  //   res.status(200).json({
  //     success: true,
  //     message: 'User is registered',
  //     // data: user,
  //     token: token,
  //   });
});

//login user => /api/v1/login
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  //checks if email or password is entered by user
  if (!email || !password) {
    return next(new ErrorHandler('Please enter email & password'), 400);
  }

  //finding user in database
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorHandler('Invalid Email or password'), 401);
  }

  //check if password is correct
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler('Invalid Email or Password'), 401);
  }

  sentToken(user, 200, res);

  //   //create JSON web token
  //   const token = user.getJwtToken();

  //   res.status(200).json({
  //     success: false,
  //     token,
  //   });
});

//forgot PAssword => /api/v1/password/forgot
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  //Check user email in database
  if (!user) {
    return next(new ErrorHandler('No user found with this email', 404));
  }
  const resetToken = await user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });
  //create reset password url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your password reset link is a follow:\n\n${resetUrl}\n\n If you have not request this, then please ignore that`;

  try {
    await sentEmail({
      email: user.email,
      subject: 'Jobee-API Password Recovery',
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent successfully to: ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler('Email is not sent'), 500);
  }
});

//Reset Password => /api/v1/password/reset/:token

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // Hash url token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler(
        'Password reset token is invalid or has been expired.',
        400
      )
    );
  }

  //setup new password

  user.password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sentToken(user, 200, res);
});

//logout user => //api/v1/logout
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});
