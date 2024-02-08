import { ErrorRequestHandler } from "express";
import sendResponse from "../utils/sendResponse";
import HttpStatusCode from "../utils/httpStatus";

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  console.error(err.stack, "#yye3872349879283"); // this should call a logger at scale.

  const errorMessage = err?.message || "Unhandled error 👋";

  sendResponse({ res })
    .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
    .json({
      isSuccess: false,
      errorMessages: [errorMessage],
    });
};
