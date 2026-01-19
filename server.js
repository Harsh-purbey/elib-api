import app from "./src/app.js";
import { config } from "./src/config/config.js";
import connectDB from "./src/config/db.js";

const startServer = async () => {
	await connectDB();
	const port = config.port || 3100;
	app.listen(port, () => {
		console.log(`Listing on port: ${port}`);
	});
};

startServer();
