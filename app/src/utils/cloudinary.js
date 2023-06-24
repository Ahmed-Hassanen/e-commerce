const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_USER_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
exports.uploadFile = (filePath, folderName) =>
  cloudinary.uploader.upload(filePath, {
    folder: `e-commerce/${folderName}`,
    width: 500,
    height: 500,
    crop: "fit",
  });
