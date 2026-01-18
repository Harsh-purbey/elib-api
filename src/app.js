import express from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";
import userRouter from "./user/user-router.js";

const app = express();

app.get("/", (req, res, next) => {
  res.json({
    message: "Welocme to elib apis",
  });
});

app.use("/api/users", userRouter);

app.use(globalErrorHandler);

export default app;
