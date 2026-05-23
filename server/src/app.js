const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const { passport } = require("./config/passport");
const env = require("./config/env");
const routes = require("./routes");
const errorMiddleware = require("./middlewares/errorMiddleware");
const notFoundMiddleware = require("./middlewares/notFoundMiddleware");

const app = express();
const allowedOrigins = [
  env.clientUrl,
  ...(env.nodeEnv === "production"
    ? []
    : ["http://localhost:5173", "http://127.0.0.1:5173"])
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin) || env.nodeEnv === "development") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(passport.initialize());

app.use("/api", routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
