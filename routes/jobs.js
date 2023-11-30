const express = require('express');
const {
  getJobs,
  newJob,
  getJobsInRadius,
  updateJob,
  deleteJob,
  getJob,
  jobStats,
  applyJob,
} = require('../controllers/jobsController');

const router = express.Router();

const { isAuthenticatedUser, authorizeRole } = require('../middleware/auth');

router.route('/jobs').get(getJobs);
router.route('/stats/:topic').get(jobStats);
router.route('/jobs/:zipcode/:distance').get(getJobsInRadius);
router
  .route('/job/:id')
  .put(isAuthenticatedUser, authorizeRole('employer', 'admin'), updateJob)
  .delete(isAuthenticatedUser, authorizeRole('employer', 'admin'), deleteJob);
router
  .route('/job/:id/apply')
  .put(isAuthenticatedUser, authorizeRole('user'), applyJob);
router.route('/job/:id/:slug').get(getJob);
router
  .route('/job/new')
  .post(isAuthenticatedUser, authorizeRole('employer', 'admin'), newJob);

module.exports = router;
