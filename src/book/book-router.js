import express from "express";
import { createBook } from "./book-controller.js";

const bookRouter = express.Router();

bookRouter.post("/", createBook);

export default bookRouter;
