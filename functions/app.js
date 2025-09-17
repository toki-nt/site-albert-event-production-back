import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import serverless from "serverless-http";
import testHandler from "../test"; // ajuste le chemin si nécessaire

const app = express();

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/.netlify/functions/app", testHandler);

export const handler = serverless(app);
