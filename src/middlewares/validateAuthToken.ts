import { NextFunction, Request, Response } from "express";
import { decodeUserIdFromAuthToken } from "../controllers/auth/helpers/authToken";
import sendResponse from "../utils/sendResponse";
import HttpStatusCode from "../utils/httpStatus";
import getPrismaClient from "../utils/getPrismaClient";

const prisma = getPrismaClient();

/** ensures there's a valid auth token in headers and populates `req.userFromToken` */
export const validateAuthToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const decodeUserIdResult = decodeUserIdFromAuthToken({ req });

  if (decodeUserIdResult.isSuccess === false) {
    return sendResponse({ res }).status(HttpStatusCode.UNAUTHORIZED).json({
      isSuccess: false,
      errorMessages: decodeUserIdResult.errorMessages,
      details: decodeUserIdResult.details,
    });
  }

  const userId = decodeUserIdResult.result;

  const user = await prisma.user.findUnique({
    where: {
      userId,
    },
  });

  if (!user) {
    return sendResponse({ res })
      .status(HttpStatusCode.UNAUTHORIZED)
      .json({
        isSuccess: false,
        errorMessages: ["Invalid auth token"],
      });
  }

  req.userFromToken = user;
  next();
};
