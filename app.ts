import serverless from "serverless-http";
import express, { Request, Response } from "express";

const app = express();

app.get("*", (req: Request, res: Response) => {
  res.send("say hello !!!");
});

export const handler = serverless(app);
