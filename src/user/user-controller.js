const createUser = async (request, response, next) => {
  response.json({ message: "User registered" });
};

export { createUser };
