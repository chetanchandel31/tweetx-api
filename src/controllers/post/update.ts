import { z } from "zod";
import getPrismaClient from "../../utils/getPrismaClient";
import { createRequestHandler } from "../../utils/createRequestHandler";
import HttpStatusCode from "../../utils/httpStatus";
import { TypeResult } from "../../types";
import { config } from "../../config";

const schemaPostUpdatePayload = z.object({
  postId: z.string({ required_error: "Post id is required" }),
  content: z
    .string({ required_error: "Content is required" })
    .min(1, { message: "Content shouldn't be empty" })
    .max(config.postContentMaxLength, {
      message: `Content shouldn't be of more than ${config.postContentMaxLength} characters`,
    }),
});
const schemaPostUpdateResponse = z.object({});

type TypePostUpdateResponse = z.infer<typeof schemaPostUpdateResponse>;

const prismaClient = getPrismaClient();

const defineHandler = createRequestHandler(
  schemaPostUpdatePayload,
  schemaPostUpdateResponse
);

const postUpdateHandler = defineHandler(async (payload, req) => {
  let status: number = HttpStatusCode.BAD_REQUEST;
  let responseData: TypeResult<TypePostUpdateResponse> = {
    isSuccess: false,
    errorMessages: ["Failed to update post"],
  };

  await prismaClient.post.update({
    where: {
      postId: payload.postId,
      userId: req.userFromToken?.userId || "",
    },
    data: {
      content: payload.content,
    },
  });

  return { responseData, status };
});

export default postUpdateHandler;
