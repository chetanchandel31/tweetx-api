import { z } from "zod";
import getPrismaClient from "../../utils/getPrismaClient";
import { createRequestHandler } from "../../utils/createRequestHandler";
import HttpStatusCode from "../../utils/httpStatus";
import { TypeResult } from "../../types";

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

  await prismaClient.follows.create({
    data: {
      followerId: req.userFromToken?.userId || "",
      followingId: payload.userToFollowId,
    },
  });

  status = HttpStatusCode.OK;
  responseData = {
    isSuccess: true,
    result: {},
  };

  return { responseData, status };
});

export default userFollowHandler;
