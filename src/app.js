import express from "express";
import { config } from "./config/config.js";
import createHttpError from "http-errors";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";

const app = express();

app.get("/", (req, res, next) => {
  const error = createHttpError(400, "Bad request");
  throw error;
  res.json({
    message: "Welocme to elib apis",
  });
});

app.use(globalErrorHandler);

export default app;
