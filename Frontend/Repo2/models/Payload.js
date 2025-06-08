const mongoose = require('mongoose');
const { Schema } = mongoose;

const fileHashSchema = new Schema({
  sha256: {
    type: String,
    required: true
  }
}, { _id: false });

const linkPayloadSchema = new Schema({
  _type: {
    type: String,
    enum: ['link'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  command: {
    type: [String],
    required: true
  },
  materials: {
    type: Map,
    of: fileHashSchema,
    required: true
  },
  products: {
    type: Map,
    of: fileHashSchema,
    required: true
  }
}, { timestamps: true });

// Export only the schema
module.exports = linkPayloadSchema;
