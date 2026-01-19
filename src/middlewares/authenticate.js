import createHttpError from "http-errors"
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

const authenticate = (request, response, next) => {
	const token = request.header('Authorization')

	if (!token) {
		return next(createHttpError(401, "Authorization token is require"));
	}

	const parsedToken = token.split(" ").at(-1);


	try {
		const decoded = jwt.verify(parsedToken, config.jwtSecret);
		request.userId = decoded.sub;

	} catch (error) {
		next(createHttpError(401, "Token expired."))
	}

	next();
}

export default authenticate;