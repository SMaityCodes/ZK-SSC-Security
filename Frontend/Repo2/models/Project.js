const mongoose = require('mongoose');
const IssueSchema = require('./Issue'); // Assuming IssueSchema is in the same directory
const { Schema } = mongoose;

const ProjectSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  organization: {
    type: String,
    required: true,
  },
  creator: {
    type: String,
    required: true,
  },
  contributors: {
    type: [String],
    default: [],
  },
  issues: [IssueSchema]  ,
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);

