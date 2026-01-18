import { config } from "../config/config.js";

const globalErrorHandler = (error, request, response, next) => {
  const statusCode = error.statusCode || 500;

  return response.status(statusCode).json({
    message: error.message,
    errorStack: config.env === "development" ? error.stack : "",
  });
};

export default globalErrorHandler;
