import jwt from "jsonwebtoken";
import getEnvVariables from "../../../utils/getEnvVariables";
import { TypeResult } from "../../../types";
import { Request } from "express";

const SECRET = getEnvVariables().SECRET;

function generateAuthToken({
  userId,
  expiresInSeconds = 60 * 60 * 24, // 24 hours
}: {
  userId: string;
  expiresInSeconds?: number;
}) {
  const authToken = jwt.sign({ userId }, SECRET, {
    expiresIn: expiresInSeconds,
  });

  const authTokenExpiresAtMs = Date.now() + expiresInSeconds * 1000;

  return { authToken, authTokenExpiresAtMs };
}

function decodeUserIdFromAuthToken({
  req,
}: {
  req: Request;
}): TypeResult<string> {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return { isSuccess: false, errorMessages: ["You need to be signed in."] };
  }

  const decodedData = jwt.verify(token, SECRET);

  if (typeof decodedData === "string") {
    return {
      isSuccess: false,
      errorMessages: ["Bad auth token."],
    };
  }

  return { isSuccess: true, result: decodedData?.userId };
}

export { generateAuthToken, decodeUserIdFromAuthToken };
