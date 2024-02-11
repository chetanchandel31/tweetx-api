import { z } from "zod";
import getPrismaClient from "../../utils/getPrismaClient";
import { createRequestHandler } from "../../utils/createRequestHandler";
import HttpStatusCode from "../../utils/httpStatus";
import { TypeResult } from "../../types";

const schemaPostListPayload = z.object({
  page: z.number(),
  perPage: z.number(),
  postedByUserIds: z.array(z.string()),
});
const schemaPostListResponse = z.object({
  totalPages: z.number(),
  nextPage: z.number().nullable(),
  items: z.array(
    z.object({
      postId: z.string(),
      userId: z.string(),
      content: z.string(),
      createdAtMs: z.number(),
      updatedAtMs: z.number(),
    })
  ),
});

type TypePostListResponse = z.infer<typeof schemaPostListResponse>;

const prismaClient = getPrismaClient();

const defineHandler = createRequestHandler(
  schemaPostListPayload,
  schemaPostListResponse
);

type TypePostsWhere = Required<
  Parameters<typeof prismaClient.post.findMany>
>[0]["where"];

const postListHandler = defineHandler(async (payload) => {
  let status: number = HttpStatusCode.BAD_REQUEST;
  let responseData: TypeResult<TypePostListResponse> = {
    isSuccess: false,
    errorMessages: ["Failed to list posts"],
  };

  let postFilters: TypePostsWhere = {};
  if (payload.postedByUserIds.length > 0) {
    postFilters = {
      userId: {
        in: payload.postedByUserIds,
      },
    };
  }

  // query database
  const posts = await prismaClient.post.findMany({
    skip: (payload.page - 1) * payload.perPage,
    take: payload.perPage,
  });

  // build items
  const items: TypePostListResponse["items"] = [];
  posts.forEach((post) => {
    items.push({
      content: post.content,
      postId: post.postId,
      userId: post.userId,
      createdAtMs: post.createdAtMs.getTime(),
      updatedAtMs: post.updatedAtMs.getTime(),
    });
  });

  // pagination meta
  const totalItemsCount = await prismaClient.post.count({});
  const totalPages = Math.ceil(totalItemsCount / payload.perPage);
  const nextPage = payload.page + 1 <= totalPages ? payload.page + 1 : null;

  status = HttpStatusCode.OK;
  responseData = {
    isSuccess: true,
    result: {
      totalPages,
      nextPage,
      items,
    },
  };

  return { responseData, status };
});

export default postListHandler;
