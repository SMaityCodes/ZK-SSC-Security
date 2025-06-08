const express = require('express');
const router = express.Router();

const {
  list,
  create,
  remove,
  projectById,
  requireSignin
} = require('../controllers/projectController');
const { userById } = require('../controllers/authController');

// Param middleware
router.param('projectId', projectById);
router.param('userId', userById);

// GET projects for a user (as creator and contributor)
router.get('/projects/:userId', requireSignin, list);

// Create a new project
router.post('/project/create/:userId', requireSignin, create);

// Delete a project
router.delete('/project/:projectId', requireSignin, remove);

module.exports = router;
