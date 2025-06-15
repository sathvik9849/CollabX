const mongoose = require('mongoose');
const toJSON = require('./plugins/toJSON.plugin');
const { tokenTypes } = require('../config/tokens');

const tokenSchema = mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Users',
      required: true,
    },
    type: {
      type: String,
      enum: [tokenTypes.REFRESH],
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    tokenFor: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

tokenSchema.plugin(toJSON);
/**
 * @typedef TokenModel
 */
const TokenModel = mongoose.model('Tokens', tokenSchema);

module.exports = TokenModel;
