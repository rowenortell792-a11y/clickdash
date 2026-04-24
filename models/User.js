const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  username: String,
  avatar: String,
  orbsBalance: { type: Number, default: 0 },
  memberSince: { type: String, default: "Feb 23, 2026" },
  systemStatus: { type: String, default: "ALPHA-PRODIGY" },
  lastActive: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
