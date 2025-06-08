const Project = require('../models/Project');
const { errorHandler } = require('../helpers/deberrorHandler');

// List all issues in a project
exports.listIssues = (req, res) => {
  if (!req.cookies.user) {
    console.log('❌ Unauthorized access to list issues');
    return res.status(401).json({ error: "User is not authenticated" });
  }

  const project = req.project;
  console.log('📋 Listing issues for project:', project._id);
  res.json(project.issues);
};

// Add an issue to a project
// Add an issue to a project
// Add an issue to a project
exports.addIssue = (req, res) => {
  if (!req.cookies.user) {
    console.log('❌ Unauthorized access to add issue');
    return res.status(401).json({ error: "User is not authenticated" });
  }

  const project = req.project;
  const { title, deadline, labels, _type, name, expected_command, expected_materials, expected_products } = req.body;

  // Ensure that expected_materials and expected_products are arrays of objects with 'rule' and 'pattern'
  const materials = expected_materials || [];
  const products = expected_products || [];

  // Validation to ensure required fields in materials/products
  const validatedMaterials = materials.map(item => ({
    rule: item.rule || "REQUIRE",  // Default value if not provided
    pattern: item.pattern && item.pattern.trim() ? item.pattern : "default-pattern"  // Default value for pattern
  }));

  const validatedProducts = products.map(item => ({
    rule: item.rule || "REQUIRE",  // Default value if not provided
    pattern: item.pattern && item.pattern.trim() ? item.pattern : "default-pattern"  // Default value for pattern
  }));

  const newIssue = {
    title,
    deadline,
    labels: labels || [],
    _type: _type || 'step',
    name,
    expected_command: expected_command || [],
    expected_materials: validatedMaterials,
    expected_products: validatedProducts,
    projectId: project._id,
  };

  project.issues.push(newIssue);

  project.save((err, updatedProject) => {
    if (err) {
      console.log('❌ Error adding issue:', err);
      return res.status(400).json({
        error: errorHandler(err)
      });
    }
    console.log('✅ Issue added:', newIssue);
    res.json(updatedProject.issues[updatedProject.issues.length - 1]);
  });
};



// Remove a specific issue from a project
exports.removeIssue = (req, res) => {
  if (!req.cookies.user) {
    console.log('❌ Unauthorized access to remove issue');
    return res.status(401).json({ error: "User is not authenticated" });
  }

  const project = req.project;
  const { issueId } = req.params;

  const issue = project.issues.id(issueId);
  if (!issue) {
    console.log('⚠️ Issue not found:', issueId);
    return res.status(404).json({ error: 'Issue not found' });
  }

  issue.remove();

  project.save((err) => {
    if (err) {
      console.log('❌ Error removing issue:', err);
      return res.status(400).json({
        error: errorHandler(err)
      });
    }
    console.log('✅ Issue removed:', issueId);
    res.json({ message: 'Issue removed successfully' });
  });
};

// Update a specific issue
exports.updateIssue = (req, res) => {
  if (!req.cookies.user) {
    console.log('❌ Unauthorized access to update issue');
    return res.status(401).json({ error: "User is not authenticated" });
  }

  const project = req.project;
  const { issueId } = req.params;
  const issue = project.issues.id(issueId);

  if (!issue) {
    console.log('⚠️ Issue not found for update:', issueId);
    return res.status(404).json({ error: 'Issue not found' });
  }

  const { title, deadline, labels, _type, name, expected_command, expected_materials, expected_products } = req.body;

  if (title !== undefined) issue.title = title;
  if (deadline !== undefined) issue.deadline = deadline;
  if (labels !== undefined) issue.labels = labels;
  if (_type !== undefined) issue._type = _type;
  if (name !== undefined) issue.name = name;
  if (expected_command !== undefined) issue.expected_command = expected_command;
  if (expected_materials !== undefined) issue.expected_materials = expected_materials;
  if (expected_products !== undefined) issue.expected_products = expected_products;

  project.save((err) => {
    if (err) {
      console.log('❌ Error updating issue:', err);
      return res.status(400).json({
        error: errorHandler(err)
      });
    }
    console.log('✅ Issue updated:', issue);
    res.json(issue);
  });
};


// 🔽 Download issue as a TXT file
exports.downloadIssueAsTxt = (req, res) => {
  if (!req.cookies.user) {
    console.log('❌ Unauthorized download attempt');
    return res.status(401).json({ error: 'User is not authenticated' });
  }

  const { issueId } = req.params;
  const project = req.project;
  const issue = project.issues.id(issueId);

  if (!issue) {
    console.log('⚠️ Issue not found for download:', issueId);
    return res.status(404).json({ error: 'Issue not found' });
  }

  // Convert to nicely formatted plain text
  const textContent = `
=== Issue: ${issue.title} ===

Name: ${issue.name}
Type: ${issue._type}
Deadline: ${issue.deadline}
Labels: ${(issue.labels || []).join(', ')}

Command:
${(issue.expected_command || []).join('\n')}

Materials:
${(issue.expected_materials || []).map(mat => `- [${mat.rule}] ${mat.pattern}`).join('\n')}

Products:
${(issue.expected_products || []).map(prod => `- [${prod.rule}] ${prod.pattern}`).join('\n')}
`;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename=issue-${issueId}.txt`);
  res.send(textContent);
};