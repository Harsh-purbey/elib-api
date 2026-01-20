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

			title, genre, author: request.userId, coverImage: uploadResult.secure_url, file: bookFileUploadResult.secure_url
		})

		// delete temp files

		try {
			await fs.promises.unlink(filePath);
			await fs.promises.unlink(bookFilePath);
			return response.status(201).json({ id: newBook._id });

		} catch (error) {
			return next(createHttpError(500, "Error while deleting temporary store files."))
		}


	} catch (error) {
		console.log(error);
		return next(createHttpError(500, "Error while uploading the files."))
	}

};

const updateBook = async (request, response, next) => {
	const { title, genre } = request.body;
	const bookId = request.params.bookId;

	const book = await bookModel.findOne({ _id: bookId });

	if (!book) {
		return next(createHttpError(404, "Book not found."));
	}

	// Check Access
	if (book.author.toString() !== request.userId) {
		return next(createHttpError(403, "You can not update other's book."));
	}

	let completeCoverImage = "";

	if (request?.files?.coverImage) {
		try {
			const coverImageMimeType = request.files.coverImage[0].mimetype.split('/').at(-1);
			const fileName = request.files.coverImage[0].filename;
			const filePath = path.resolve(process.cwd(), "public/data/uploads", fileName)

			const uploadResult = await cloudinary.uploader.upload(filePath, {
				filename_override: fileName,
				folder: "book-covers",
				format: coverImageMimeType
			})

			completeCoverImage = uploadResult.secure_url;

		} catch (error) {
			return next(createHttpError(500, "Error while uploading the cover image."))
		}
	}

	let completeFileName = "";

	if (request?.files?.file) {
		try {
			const bookFileName = request.files.file[0].filename;
			const bookFilePath = path.resolve(process.cwd(), "public/data/uploads", bookFileName)

			const bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath, {
				resource_type: "raw",
				filename_override: bookFileName,
				folder: "book-pdfs",
				format: 'pdf'
			})

			completeFileName = bookFileUploadResult.secure_url;

		} catch (error) {
			return next(createHttpError(500, "Error while uploading the pdf file."))
		}
	}

	try {
		const updatedBook = await bookModel.findByIdAndUpdate({ _id: bookId }, {
			title: title ? title : book.title,
			genre: genre ? genre : book.genre,
			coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
			file: completeFileName ? completeFileName : book.file
		}, { new: true });

		return response.status(200).json(updatedBook);
	} catch (error) {
		return next(createHttpError(500, "Error while updating the book."));
	}


}

export { createBook, updateBook };
