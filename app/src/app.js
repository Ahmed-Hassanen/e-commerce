const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const userRouter = require("./routes/userRouter");
const orderRouter = require("./routes/orderRouter");
const reviewRouter = require("./routes/reviewRouter");
const productRouter = require("./routes/productRouter");
const categoryRouter = require("./routes/categoryRouter");
const app = express();

app.use(helmet());
app.enable("trust proxy");
app.use(cookieParser());

// middlewares
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 100,
  window: 60 * 60 * 1000,
  message: "too many request try in an hour",
});

app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));

app.use(mongoSanitize());

app.use(xss());

app.use(compression());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/reviews", reviewRouter);

app.all("*", (req, res, next) => {
  // const err = new Error(`can't find ${req.originalUrl} on this server `);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`can't find ${req.originalUrl} on this server `, 404));
});

app.use(globalErrorHandler);

module.exports = app;
