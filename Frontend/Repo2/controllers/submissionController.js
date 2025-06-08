const Submission = require('../models/Subs');
const { errorHandler } = require('../helpers/deberrorHandler');

// Create a new submission for an issue in a project
exports.createSubmission = async (req, res) => {
  if (!req.cookies.user) {
    console.log('❌ Unauthorized submission attempt');
    return res.status(401).json({ error: "User is not authenticated" });
  }

  const { projectId, issueId } = req.params;
  const payload = req.body;

  try {
    const submission = new Submission({
      projectId,
      issueId,
      payload
    });

    await submission.save();
    console.log('✅ Submission created:', submission._id);
    res.json(submission);
  } catch (err) {
    console.error('❌ Error creating submission:', err);
    res.status(400).json({ error: errorHandler(err) });
  }
};

// List ALL submissions across all projects/issues (admin/debugging purpose)
exports.listAllSubmissions = async (req, res) => {
  if (!req.cookies.user) {
    console.log('❌ Unauthorized fetch attempt');
    return res.status(401).json({ error: "User is not authenticated" });
  }

  try {
    const submissions = await Submission.find().sort({ createdAt: -1 });
    console.log(`📄 Total submissions found: ${submissions.length}`);
    res.json(submissions);
  } catch (err) {
    console.error('❌ Error fetching submissions:', err);
    res.status(400).json({ error: errorHandler(err) });
  }
};

// List submissions for a specific issue in a specific project
exports.listSubmissionsByIssueInProject = async (req, res) => {
  if (!req.cookies.user) {
    console.log('❌ Unauthorized fetch attempt');
    return res.status(401).json({ error: "User is not authenticated" });
  }

  const { projectId, issueId } = req.params;

  try {
    const submissions = await Submission.find({ projectId, issueId }).sort({ createdAt: -1 });
    console.log(`📄 ${submissions.length} submissions for issue ${issueId} in project ${projectId}`);
    res.json(submissions);
  } catch (err) {
    console.error('❌ Error fetching issue submissions:', err);
    res.status(400).json({ error: errorHandler(err) });
  }
};
