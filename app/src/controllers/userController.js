const User = require("../models/userModel");
const handlerFactory = require("./handlerFactory");

exports.getAllUsers = handlerFactory.getAll(User);
exports.deleteUser = handlerFactory.deleteOne(User);
exports.getOneUser = handlerFactory.getOne(User);
