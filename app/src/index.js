const mongoose = require("mongoose");

process.on("uncaughtException", (err) => {
  console.log("uncaughted Exception 💥 Shutting down");
  console.log(err);
  process.exit(1);
});

const app = require("./app");

const DB = process.env.MONGO_URL;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connection done");
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  //console.log(`app running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection 💥 Shutting down");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
