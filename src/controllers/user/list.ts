import { z } from "zod";
import getPrismaClient from "../../utils/getPrismaClient";
import { createRequestHandler } from "../../utils/createRequestHandler";
import HttpStatusCode from "../../utils/httpStatus";
import { TypeResult } from "../../types";

const schemaUserListPayload = z.object({
  page: z.number(),
  perPage: z.number(),
});
const schemaUserListResponse = z.object({
  totalPages: z.number(),
  nextPage: z.number().nullable(),
  items: z.array(
    z.object({
      userId: z.string(),
      isFollowed: z.boolean(),
      followersCount: z.number(),
      name: z.string(),
    })
  ),
});

type TypeUserListResponse = z.infer<typeof schemaUserListResponse>;

const prismaClient = getPrismaClient();

const defineHandler = createRequestHandler(
  schemaUserListPayload,
  schemaUserListResponse
);

const userListHandler = defineHandler(async (payload, req) => {
  let status: number = HttpStatusCode.BAD_REQUEST;
  let responseData: TypeResult<TypeUserListResponse> = {
    isSuccess: false,
    errorMessages: ["Failed to list users"],
  };

  const userListFilters = {
    userId: { notIn: [req.userFromToken?.userId || ""] },
  };

  // db query
  const users = await prismaClient.user.findMany({
    skip: (payload.page - 1) * payload.perPage,
    take: payload.perPage,

    where: userListFilters,

    select: {
      userId: true,
      name: true,
      followers: {
        select: {
          followerId: true,
        },
      },
    },
  });

  // build items
  const items: TypeUserListResponse["items"] = [];
  users.forEach((user) => {
    let isFollowed = false;
    user.followers.forEach((follower) => {
      if (follower.followerId === req.userFromToken?.userId) {
        isFollowed = true;
      }
    });

    items.push({
      name: user.name,
      userId: user.userId,
      followersCount: user.followers.length,
      isFollowed,
    });
  });

  // pagination meta
  const totalItemsCount = await prismaClient.user.count({
    where: userListFilters,
  });
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

export default userListHandler;
