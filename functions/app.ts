import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import serverless from "serverless-http";
import { handler as appHandler } from "../app"; // importe le handler de app.ts

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Redirige toutes les requêtes vers le handler de app.ts
app.use("/.netlify/functions/app", (req, res, next) => {
  // Comme serverless-http retourne un handler Lambda, on l'appelle directement
  return appHandler(req, res, next as any);
});

export const handler = serverless(app);
