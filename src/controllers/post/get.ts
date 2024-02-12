import { z } from "zod";
import getPrismaClient from "../../utils/getPrismaClient";
import { createRequestHandler } from "../../utils/createRequestHandler";
import HttpStatusCode from "../../utils/httpStatus";
import { TypeResult } from "../../types";

const schemaPostGetPayload = z.object({
  postId: z.string({ required_error: "Post id is required" }),
});

const schemaPostGetResponse = z.object({
  postId: z.string(),
  userId: z.string(),
  content: z.string(),
  createdAtMs: z.number(),
  updatedAtMs: z.number(),
});

type TypePostGetResponse = z.infer<typeof schemaPostGetResponse>;

const prismaClient = getPrismaClient();

const defineHandler = createRequestHandler(
  schemaPostGetPayload,
  schemaPostGetResponse
);

const postGetHandler = defineHandler(async (payload) => {
  let status: number = HttpStatusCode.BAD_REQUEST;
  let responseData: TypeResult<TypePostGetResponse> = {
    isSuccess: false,
    errorMessages: ["Failed to fetch post"],
  };

  const post = await prismaClient.post.findUnique({
    where: {
      postId: payload.postId,
    },
  });

  if (!post) {
    status = HttpStatusCode.NOT_FOUND;
    responseData = {
      isSuccess: false,
      errorMessages: ["No post found"],
    };
    return { responseData, status };
  }

  status = HttpStatusCode.OK;
  responseData = {
    isSuccess: true,
    result: {
      content: post.content,
      postId: post.postId,
      userId: post.userId,
      createdAtMs: post.createdAtMs.getTime(),
      updatedAtMs: post.updatedAtMs.getTime(),
    },
  };

  return { responseData, status };
});

export default postGetHandler;
