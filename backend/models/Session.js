const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  roomId: String,
  title: String,
  durationStr: String,
  participantsCount: Number,
  aiSummary: String,
  recordingAvailable: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Session', SessionSchema);
