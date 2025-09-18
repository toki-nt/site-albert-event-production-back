"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationErrors = void 0;
// Solution de contournement
const getValidationResult = (req) => {
    // @ts-ignore
    return require("express-validator").validationResult(req);
};
const handleValidationErrors = (req, res, next) => {
    const errors = getValidationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Validation failed",
            errors: errors.array(),
        });
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
