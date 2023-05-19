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
    type: String,
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
    min: 1,
  },
  seller: {
    type: mongoose.Schema.ObjectId,
  },
});

productSchema.pre(/^find/, function (next) {
  this.populate({ path: "category" });

  next();
});

const product = mongoose.model("Product", productSchema);

module.exports = product;
