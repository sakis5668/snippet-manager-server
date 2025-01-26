const mongoose = require("mongoose");

const snippetSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    code: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Snippet = mongoose.model("snippet", snippetSchema);

module.exports = Snippet;
