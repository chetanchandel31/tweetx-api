import { z } from "zod";
import getPrismaClient from "../../utils/getPrismaClient";
import { createRequestHandler } from "../../utils/createRequestHandler";
import HttpStatusCode from "../../utils/httpStatus";
import { TypeResult } from "../../types";

const schemaUserUnFollowPayload = z.object({
  userToUnFollowId: z.string({ required_error: "User id is required" }),
});

const schemaUserUnFollowResponse = z.object({});

type TypeUserUnFollowResponse = z.infer<typeof schemaUserUnFollowResponse>;

const prismaClient = getPrismaClient();

const defineHandler = createRequestHandler(
  schemaUserUnFollowPayload,
  schemaUserUnFollowResponse
);

const userUnFollowHandler = defineHandler(async (payload, req) => {
  let status: number = HttpStatusCode.BAD_REQUEST;
  let responseData: TypeResult<TypeUserUnFollowResponse> = {
    isSuccess: false,
    errorMessages: ["Failed to un-follow user"],
  };

  if (payload.userToUnFollowId === req.userFromToken?.userId) {
    responseData.errorMessages = ["You can't un-follow yourself"];
    return { responseData, status };
  }

  await prismaClient.follows.delete({
    where: {
      followedId_followerId: {
        followerId: req.userFromToken?.userId || "",
        followedId: payload.userToUnFollowId,
      },
    },
  });

  status = HttpStatusCode.OK;
  responseData = {
    isSuccess: true,
    result: {},
  };

  return { responseData, status };
});

export default userUnFollowHandler;
