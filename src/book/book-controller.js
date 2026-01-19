import path from "path";
import cloudinary from "../config/cloudinary.js";
import createHttpError from "http-errors";

const createBook = async (request, response, next) => {

	console.log('FILES', request.files);


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

	} catch (error) {
		console.log(error);
		return next(createHttpError(500, "Error while uploading the files."))
	}


	return response.json({});
};

export { createBook };
