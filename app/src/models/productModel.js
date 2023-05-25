const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "product must has a name"],
  },
  description: {
    type: String,
    required: [true, "product must has a description"],
  },
  photo: {
    type: String,
  },
  category: {
    type: mongoose.Schema.ObjectId,
    required: [true, "product must has a category"],
    ref: "Category",
  },
  price: {
    type: Number,
    required: [true, "product must has a price"],
    min: 1,
  },
  quantity: {
    type: Number,
    required: [true, "product must has a quantity"],
    min: 0,
  },
  seller: {
    type: mongoose.Schema.ObjectId,
    required: [true, "product must has a seller"],
    ref: "User",
  },
});

productSchema.pre(/^findOne/, function (next) {
  this.populate({ path: "category" });

  next();
});

const product = mongoose.model("Product", productSchema);

module.exports = product;
