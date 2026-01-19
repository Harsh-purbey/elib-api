import express from "express";
import path from "path";
import multer from "multer";
import { createBook } from "./book-controller.js";

const bookRouter = express.Router();

// file store local
const upload = multer({
    dest: path.resolve(process.cwd(), "public/data/uploads"),
    limits: { fileSize: 3e7 } // 30mb -> 30 * 1024 * 1024 like that
})

bookRouter.post("/", upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: "file", maxCount: 1 }
]), createBook);

export default bookRouter;
