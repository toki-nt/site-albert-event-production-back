const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const serverless = require("serverless-http");
const app = require("../app"); // Import de votre app Express

// Création d'une instance Express pour Netlify
const netlifyApp = express();

// Middleware
netlifyApp.use(bodyParser.json());
netlifyApp.use(express.urlencoded({ extended: true }));
netlifyApp.use(cors());

// Montez votre application principale sur le chemin Netlify
netlifyApp.use("/.netlify/functions/app", app.default || app);

// Handler pour Netlify Functions
exports.handler = serverless(netlifyApp);
