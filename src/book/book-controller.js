import path from "path";
import cloudinary from "../config/cloudinary.js";
import createHttpError from "http-errors";
import bookModel from "./book-model.js";
import fs from "fs";

const createBook = async (request, response, next) => {

	const { title, genre, description } = request.body

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
			title, description, genre, author: request.userId, coverImage: uploadResult.secure_url, file: bookFileUploadResult.secure_url
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
	const { title, genre, description } = request.body;
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
			description: description ? description : book.description,
			coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
			file: completeFileName ? completeFileName : book.file
		}, { new: true });

		return response.status(200).json(updatedBook);
	} catch (error) {
		return next(createHttpError(500, "Error while updating the book."));
	}


}

const listBooks = async (request, response, next) => {

	try {
		const booksList = await bookModel.find().populate("author", "name");
		return response.status(200).json(booksList);
	} catch (error) {
		return next(createHttpError(500, "Error while getting a book."))
	}
}

const getSingleBook = async (request, response, next) => {
	const bookId = request.params.bookId;

	try {
		const book = await bookModel.findOne({ _id: bookId }).populate("author", "name");

		if (!book) {
			return next(createHttpError(404, "Book not found."))
		}

		return response.status(200).json(book)

	} catch (error) {
		return next(createHttpError(500, "Error while getting a book."))

	}
}

const deleteBook = async (request, response, next) => {
	const bookId = request.params.bookId;
	try {
		const book = await bookModel.findOne({ _id: bookId });

		if (!book) {
			return next(createHttpError(404, "Book not found."))
		}

		if (book.author.toString() !== request.userId) {
			return next(createHttpError(403, "You can not delete other's book."))
		}

		try {
			const coverFileSplits = book.coverImage.split('/');
			const coverImagePublicId = coverFileSplits.at(-2) + '/' + (coverFileSplits.at(-1).split('.')[0])
			await cloudinary.uploader.destroy(coverImagePublicId)
		} catch (error) {
			return next(createHttpError(500, "Error while deleting the cover image."))
		}

		try {
			const bookFileSplits = book.file.split('/');
			const filePublicId = bookFileSplits.at(-2) + '/' + bookFileSplits.at(-1)
			await cloudinary.uploader.destroy(filePublicId, { resource_type: "raw" })
		} catch (error) {
			return next(createHttpError(500, "Error while deleting the pdf file."))
		}

		try {
			await bookModel.deleteOne({ _id: bookId })
			return response.sendStatus(204);
		} catch (error) {
			return next(createHttpError(500, "Error while deleting the book."))

		}

	} catch (error) {
		return next(createHttpError(500, "Error while getting the book."))
	}
}

export { createBook, updateBook, listBooks, getSingleBook, deleteBook };
