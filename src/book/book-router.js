import express from "express";
import path from "path";
import multer from "multer";
import { createBook, updateBook } from "./book-controller.js";
import authenticate from "../middlewares/authenticate.js";

const bookRouter = express.Router();

// file store local
const upload = multer({
    dest: path.resolve(process.cwd(), "public/data/uploads"),
    limits: { fileSize: 3e7 } // 30mb -> 30 * 1024 * 1024 like that
})

bookRouter.post("/", authenticate, upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: "file", maxCount: 1 }
]), createBook);

bookRouter.patch("/:bookId", authenticate, upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: "file", maxCount: 1 }
]), updateBook);

export default bookRouter;
