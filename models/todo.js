const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  completed: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: null,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low",
  },
}, { timestamps: true });

module.exports = mongoose.model("Todo", todoSchema);