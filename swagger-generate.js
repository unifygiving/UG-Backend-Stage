import swaggerAutogen from "swagger-autogen";
const swaggerAutogenInstance = swaggerAutogen();

const doc = {
	info: {
		version: "v1",
		title: "Unify Giving Backend API(Staging and Development)",
		description:
			"API Base URL:  https://ug-backend-58bx.onrender.com",
	},
	host: process.env.API_BASE_URL,
	basePath: "/",
	schemes: [process.env.API_HTTP_SCHEME || "https"],
	consumes: ["application/json"],
	produces: ["application/json"],
	tags: [{ name: "Users" }],
	securityDefinitions: {
		JWT_authentication: {
			type: "apiKey",
			in: "header",
			name: "Authorization",
			description:
				'For the "Authorization" header you must set a value of "Bearer your_jwt_token_here".',
		},
	},
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./app.js"];

(async () => {
	await swaggerAutogenInstance(outputFile, endpointsFiles, doc);
	await import("./bin/www.js");
})();
