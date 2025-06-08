const express = require('express');
const router = express.Router();
const { projectById } = require('../controllers/projectController');
const {
  listIssues,
  addIssue,
  removeIssue,
  updateIssue,
  downloadIssueAsTxt
} = require('../controllers/issueController');
const { requireSignin, projectById } = require('../controllers/projectController');


// Nested issue routes under project with authentication
router.get('/project/:projectId/issues', requireSignin, listIssues);
router.post('/project/:projectId/issue', requireSignin, addIssue);
router.put('/project/:projectId/issue/:issueId', requireSignin, updateIssue);
router.delete('/project/:projectId/issue/:issueId', requireSignin, removeIssue);
router.get('/project/:projectId/issue/:issueId/download-txt', requireSignin, projectById, downloadIssueAsTxt);

// param middleware
router.param('projectId', projectById);

module.exports = router;
