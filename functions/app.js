import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import serverless from "serverless-http";
// import testHandler from "../test.ts"; // ajuste le chemin si nécessaire
import api_start from "../test.ts"; // ajuste le chemin si nécessaire

const app = express();
require.extensions[".ts"] = function (module, filename) {
  const fs = require("fs");
  const content = fs.readFileSync(filename, "utf8");
  // Vous pouvez ajouter une transpilation TypeScript ici si nécessaire
  module._compile(content, filename);
};

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// app.use("/.netlify/functions/app", testHandler);
app.use("/.netlify/functions/app", api_start);

export const handler = serverless(app);
