const app = require("../app");
const serverless = require("serverless-http");

// Handler Netlify Functions
exports.handler = serverless(app.default || app);
