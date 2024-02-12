import { z } from "zod";
import getPrismaClient from "../../utils/getPrismaClient";
import { createRequestHandler } from "../../utils/createRequestHandler";
import HttpStatusCode from "../../utils/httpStatus";
import { TypeResult } from "../../types";
import { Prisma } from "@prisma/client";

const schemaUserFollowPayload = z.object({
  userToFollowId: z.string({ required_error: "User id is required" }),
});

const schemaUserFollowResponse = z.object({});

type TypeUserFollowResponse = z.infer<typeof schemaUserFollowResponse>;

const prismaClient = getPrismaClient();

const defineHandler = createRequestHandler(
  schemaUserFollowPayload,
  schemaUserFollowResponse
);

const userFollowHandler = defineHandler(async (payload, req) => {
  let status: number = HttpStatusCode.BAD_REQUEST;
  let responseData: TypeResult<TypeUserFollowResponse> = {
    isSuccess: false,
    errorMessages: ["Failed to follow user"],
  };

  if (payload.userToFollowId === req.userFromToken?.userId) {
    responseData.errorMessages = ["You can't follow yourself"];
    return { responseData, status };
  }
  try {
    await prismaClient.follows.create({
      data: {
        followerId: req.userFromToken?.userId || "",
        followedId: payload.userToFollowId,
      },
    });

    status = HttpStatusCode.OK;
    responseData = {
      isSuccess: true,
      result: {},
    };
  } catch (error) {
    status = HttpStatusCode.INTERNAL_SERVER_ERROR;
    responseData = {
      isSuccess: false,
      errorMessages: ["Failed to follow user"],
      details: error,
    };

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      status = HttpStatusCode.CONFLICT;
      responseData = {
        isSuccess: false,
        errorMessages: ["You are already followed the user"],
        details: error,
      };
    }
  }

  return { responseData, status };
});

export default userFollowHandler;
