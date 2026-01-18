import createHttpError from "http-errors";
import userModel from "./user-model";

const createUser = async (request, response, next) => {
  const { name, email, password } = request.body;
  // Validation
  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields are required.");
    return next(error);
  }
  //Database call
  const user = await userModel.findOne({ email });
  if (user) {
    const error = createHttpError(400, "User already exists with this email.");
    return next(error);
  }
  // Process
  // Response
  response.json({ message: "User registered" });
};

export { createUser };
