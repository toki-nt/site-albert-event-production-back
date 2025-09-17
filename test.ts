import { Request, Response } from "express";

const testHandler = (req: Request, res: Response) => {
  res.json({ message: "Hello from test.ts!" });
};

export default testHandler;
