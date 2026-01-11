import { Request, Response, NextFunction } from "express";
import Joi from "joi";

type ValidationTarget = "body" | "query" | "params";

export const validate = (
  schema: Joi.ObjectSchema,
  target: ValidationTarget = "body"
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const dataToValidate = req[target];

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false, // Return all errors
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      const errorMessages = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Validation Error",
        errors: errorMessages,
      });
      return;
    }

    // Replace request data with validated (and sanitized) data
    req[target] = value;
    next();
  };
};

// Validate multiple targets
export const validateMultiple = (
  schemas: { schema: Joi.ObjectSchema; target: ValidationTarget }[]
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const allErrors: { field: string; message: string }[] = [];

    for (const { schema, target } of schemas) {
      const { error, value } = schema.validate(req[target], {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        error.details.forEach((detail) => {
          allErrors.push({
            field: `${target}.${detail.path.join(".")}`,
            message: detail.message,
          });
        });
      } else {
        req[target] = value;
      }
    }

    if (allErrors.length > 0) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Validation Error",
        errors: allErrors,
      });
      return;
    }

    next();
  };
};
