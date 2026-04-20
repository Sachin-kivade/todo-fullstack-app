const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: String,

  resetOTP: String,
  otpExpiry: Date
});
module.exports = mongoose.model("User", userSchema);