import { z } from "zod";
import getPrismaClient from "../../utils/getPrismaClient";
import { createRequestHandler } from "../../utils/createRequestHandler";
import HttpStatusCode from "../../utils/httpStatus";
import { TypeResult } from "../../types";
import { config } from "../../config";

const schemaPostCreatePayload = z.object({
  content: z
    .string({ required_error: "Content is required" })
    .max(config.postContentMaxLength, {
      message: `Content shouldn't be of more than ${config.postContentMaxLength} characters`,
    }),
});
const schemaPostCreateResponse = z.object({});

type TypePostCreateResponse = z.infer<typeof schemaPostCreateResponse>;

const prismaClient = getPrismaClient();

const defineHandler = createRequestHandler(
  schemaPostCreatePayload,
  schemaPostCreateResponse
);

const postCreateHandler = defineHandler(async (payload, req) => {
  let status: number = HttpStatusCode.BAD_REQUEST;
  let responseData: TypeResult<TypePostCreateResponse> = {
    isSuccess: false,
    errorMessages: ["Failed to create post"],
  };

  await prismaClient.post.create({
    data: {
      content: payload.content,
      userId: req.userFromToken?.userId || "",
    },
  });

  status = HttpStatusCode.OK;
  responseData = {
    isSuccess: true,
    result: {},
  };

  return { responseData, status };
});

export default postCreateHandler;
