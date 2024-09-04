import { body, validationResult } from "express-validator";
import prisma from "../../prisma";
import { NextFunction, Request, Response } from "express";

export const dataValidation = [
  body("email")
    .notEmpty()
    .withMessage("Please input an email")
    .isEmail()
    .withMessage("Format email is wrong")
    .custom(async (email) => {
      const findExistingEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (findExistingEmail) {
        throw new Error("Email is already in use");
      }
      return true;
    }),
  body("firstName").notEmpty().withMessage("Please input your name"),
  body("lastName").notEmpty().withMessage("Please input your name"),
  body("position").notEmpty().withMessage("Please input your position"),
  body("phone").notEmpty().withMessage("Please input your phone"),
  (req: Request, res: Response, next: NextFunction) => {
    const errorValidation = validationResult(req);
    if (!errorValidation.isEmpty()) {
      return res.status(400).send({
        success: false,
        error: errorValidation,
      });
    }
    next();
  },
];
