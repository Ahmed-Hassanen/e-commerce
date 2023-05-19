const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "product must has a name"],
  },
  description: {
    type: String,
    required: [true, "product must has a description"],
  },
});

const category = mongoose.model("Category", categorySchema);

module.exports = category;
