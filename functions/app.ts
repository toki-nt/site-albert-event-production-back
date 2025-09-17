import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import serverless from "serverless-http";
import app_ts from "../app";

const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use("/.netlify/functions/app", app_ts);

export const handler = serverless(app);
