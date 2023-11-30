const express = require('express');
const router = express.Router();

const {
  getUserProfile,
  updatePassword,
  updateUser,
  deleteUser,
  getAppliedJobs,
  getPublishedJobs,
  getUsers,
  deleteUserAdmin,
} = require('../controllers/userController');
const { isAuthenticatedUser, authorizeRole } = require('../middleware/auth');

router.use(isAuthenticatedUser);

router.route('/me').get(getUserProfile);
router.route('/jobs/applied').get(authorizeRole('user'), getAppliedJobs);
router
  .route('/jobs/published')
  .get(authorizeRole('employer', 'admin'), getPublishedJobs);
router.route('/me/update').put(updateUser);
router.route('/me/delete').delete(deleteUser);
router.route('/password/update').put(updatePassword);

//admin only routes

router.route('/users').get(authorizeRole('admin'), getUsers);
router.route('/user/:id').get(authorizeRole('admin'), deleteUserAdmin);

module.exports = router;
