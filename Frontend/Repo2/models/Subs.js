const mongoose = require('mongoose');
const linkPayloadSchema = require('./Payload'); // Adjust path if needed

const submissionSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  issueId: {
    type: String, // Or mongoose.Types.ObjectId if your issue IDs are ObjectIds
    required: true
  },
  payload: {
    type: linkPayloadSchema,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
