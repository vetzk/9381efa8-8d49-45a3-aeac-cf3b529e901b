import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";

export const dataUpdateValidation = [
  // Validate that the body is an array of users
  body().isArray().withMessage("Request body should be an array of users"),

  // Validate each user object in the array
  body("*.email")
    .notEmpty()
    .withMessage("Please input an email")
    .isEmail()
    .withMessage("Email format is wrong"),

  body("*.firstName").notEmpty().withMessage("Please input your first name"),

  body("*.lastName").notEmpty().withMessage("Please input your last name"),

  body("*.position").notEmpty().withMessage("Please input your position"),

  body("*.phone").notEmpty().withMessage("Please input your phone"),

  // Handle validation results
  (req: Request, res: Response, next: NextFunction) => {
    const errorValidation = validationResult(req);
    if (!errorValidation.isEmpty()) {
      return res.status(400).send({
        success: false,
        errors: errorValidation.array(),
      });
    }
    next();
  },
];
