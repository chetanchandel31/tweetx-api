import { RequestHandler } from "express";
import sendResponse from "../utils/sendResponse";
import HttpStatusCode from "../utils/httpStatus";

export const routeNotFound: RequestHandler = (req, res, next) => {
  sendResponse({ res })
    .status(HttpStatusCode.NOT_FOUND)
    .json({
      isSuccess: false,
      errorMessages: ["The route you're looking for couldn't be found"],
    });
};
