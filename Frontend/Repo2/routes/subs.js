const express = require('express');
const router = express.Router();

const {
  createSubmission,
  listAllSubmissions,
  listSubmissionsByIssueInProject
} = require('../controllers/submissionController');

const { requireSignin } = require('../controllers/projectController'); // ✅ Import requireSignin

// Create a submission for an issue
router.post('/project/:projectId/issue/:issueId/submit', requireSignin, createSubmission);

// List all submissions
router.get('/submissions', requireSignin, listAllSubmissions);

// List submissions for a specific issue in a project
router.get('/project/:projectId/issue/:issueId/submissions', requireSignin, listSubmissionsByIssueInProject);

module.exports = router;
