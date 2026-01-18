import express from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";
import userRouter from "./user/user-router.js";
import bookRouter from "./book/book-router.js";

const app = express();

app.use(express.json());

app.get("/", (req, res, next) => {
  res.json({
    message: "Welocme to elib apis",
  });
});

app.use("/api/users", userRouter);
app.use("/api/books", bookRouter);

app.use(globalErrorHandler);

export default app;
