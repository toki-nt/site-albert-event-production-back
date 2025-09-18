import { Request, Response, NextFunction } from "express";

// Solution de contournement
const getValidationResult = (req: Request) => {
  // @ts-ignore
  return require("express-validator").validationResult(req);
};

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = getValidationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};
