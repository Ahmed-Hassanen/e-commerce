const category = require("../models/categoryModel");
const handlerFactory = require("./handlerFactory");

exports.addCategory = handlerFactory.createOne(category);
exports.getAllCategories = handlerFactory.getAll(category);
exports.getCategory = handlerFactory.getOne(category);
exports.updateCategory = handlerFactory.updateOne(category);
exports.deleteCategory = handlerFactory.deleteOne(category);
