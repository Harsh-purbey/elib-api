import createHttpError from "http-errors";

const createUser = async (request, response, next) => {
  const { name, email, password } = request.body;
  // Validation
  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }
  // Process
  // Response
  response.json({ message: "User registered" });
};

export { createUser };
