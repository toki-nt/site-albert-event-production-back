require("ts-node/register"); // permet de charger les .ts
const testHandler = require("../test.ts"); // maintenant ça fonctionne
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const serverless = require("serverless-http");

const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use("/.netlify/functions/app", testHandler);

module.exports.handler = serverless(app);
