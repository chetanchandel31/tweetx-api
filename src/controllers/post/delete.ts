import { z } from "zod";
import getPrismaClient from "../../utils/getPrismaClient";
import { createRequestHandler } from "../../utils/createRequestHandler";
import HttpStatusCode from "../../utils/httpStatus";
import { TypeResult } from "../../types";

const schemaPostDeletePayload = z.object({
  postId: z.string({ required_error: "Post id is required" }),
});

const schemaPostDeleteResponse = z.object({});

type TypePostDeleteResponse = z.infer<typeof schemaPostDeleteResponse>;

const prismaClient = getPrismaClient();

const defineHandler = createRequestHandler(
  schemaPostDeletePayload,
  schemaPostDeleteResponse
);

const postDeleteHandler = defineHandler(async (payload, req) => {
  let status: number = HttpStatusCode.BAD_REQUEST;
  let responseData: TypeResult<TypePostDeleteResponse> = {
    isSuccess: false,
    errorMessages: ["Failed to delete post"],
  };

  await prismaClient.post.delete({
    where: {
      postId: payload.postId,
      userId: req.userFromToken?.userId,
    },
  });

  status = HttpStatusCode.OK;
  responseData = {
    isSuccess: true,
    result: {},
  };

  return { responseData, status };
});

export default postDeleteHandler;
