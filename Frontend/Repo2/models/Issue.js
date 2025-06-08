// models/Issue.js
const mongoose = require('mongoose');

const RulePatternSchema = new mongoose.Schema({
  rule: {
    type: String,
    enum: ["CREATE", "DELETE", "MODIFY", "ALLOW", "REQUIRE", "DISALLOW"],
    required: true,
  },
  pattern: {
    type: String,
    required: false,  // Make 'pattern' optional
    default: '',      // Set default value as empty string if not provided
  },
}, { _id: false });  // Disable _id for subdocument array elements


const IssueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  deadline: { type: Date },
  labels: { type: [String], default: [] },
  _type: { type: String, enum: ['step'], default: 'step' },
  name: { type: String, required: true },
  expected_command: { type: [String], default: [] },
  expected_materials: { type: [RulePatternSchema], default: [] },
  expected_products: { type: [RulePatternSchema], default: [] },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
}, { timestamps: true });

module.exports = IssueSchema;   // Export **schema**, not model
