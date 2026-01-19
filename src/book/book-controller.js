import path from "path";
import cloudinary from "../config/cloudinary.js";
import createHttpError from "http-errors";
import bookModel from "./book-model.js";
import fs from "fs";

const createBook = async (request, response, next) => {

	const { title, genre } = request.body

	try {
		const coverImageMimeType = request.files.coverImage[0].mimetype.split('/').at(-1);
		const fileName = request.files.coverImage[0].filename;
		const filePath = path.resolve(process.cwd(), "public/data/uploads", fileName)

		const uploadResult = await cloudinary.uploader.upload(filePath, {
			filename_override: fileName,
			folder: "book-covers",
			format: coverImageMimeType
		})


		const bookFileName = request.files.file[0].filename;
		const bookFilePath = path.resolve(process.cwd(), "public/data/uploads", bookFileName)

		const bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath, {
			resource_type: "raw",
			filename_override: bookFileName,
			folder: "book-pdfs",
			format: 'pdf'
		})

		const newBook = await bookModel.create({
			title, genre, author: '696cd6234e492c5026108ed7', coverImage: uploadResult.secure_url, file: bookFileUploadResult.secure_url
		})

		// delete temp files

		try {
			await fs.promises.unlink(filePath);
			await fs.promises.unlink(bookFilePath);
			return response.status(201).json({ id: newBook._id });

		} catch (error) {
         return next(createHttpError(500,"Error while deleting temporary store files."))
		}






	} catch (error) {
		console.log(error);
		return next(createHttpError(500, "Error while uploading the files."))
	}

};

export { createBook };
