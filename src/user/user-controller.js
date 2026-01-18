import createHttpError from "http-errors";
import userModel from "./user-model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

const createUser = async (request, response, next) => {
  const { name, email, password } = request.body;
  // Validation
  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields are required.");
    return next(error);
  }
  //Database call
  try {
    const user = await userModel.findOne({ email });
    if (user) {
      const error = createHttpError(
        400,
        "User already exists with this email.",
      );
      return next(error);
    }
  } catch (error) {
    return next(createHttpError(500, "Error while getting user"));
  }

  // password -> hash

  const hashedPassword = await bcrypt.hash(password, 10);

  // Process
  let newUser;
  try {
    newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while creating user"));
  }

  try {
    // Token generation
    const token = jwt.sign({ sub: newUser._id }, config.jwtSecret, {
      expiresIn: "7d",
      algorithm: "HS256",
    });
    // Response
    response.status(201).json({
      accessToken: token,
      message: "User registered successfully",
    });
  } catch (error) {
    return next(createHttpError(500, "Error while signing the jwt token"));
  }
};

const loginUser = async (request, response, next) => {
  const { email, password } = request.body;
  if (!email || !password) {
    return next(createHttpError(400, "All fields are required"));
  }

  let user;
  try {
    user = await userModel.findOne({ email });
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }
  } catch (error) {
    return next(createHttpError(500, "Error while getting user"));
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(createHttpError(400, "Username or password incprrect!"));
  }

  try {
    const token = jwt.sign({ sub: user._id }, config.jwtSecret, {
      expiresIn: "7d",
      algorithm: "HS256",
    });
    return response.status(201).json({
      accessToken: token,
      message: "User logged in successfully",
    });
  } catch (error) {
    return next(createHttpError(500, "Error while signing the jwt token"));
  }
};

export { createUser, loginUser };
