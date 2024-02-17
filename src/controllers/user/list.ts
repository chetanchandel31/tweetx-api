import { z } from "zod";
import getPrismaClient from "../../utils/getPrismaClient";
import { createRequestHandler } from "../../utils/createRequestHandler";
import HttpStatusCode from "../../utils/httpStatus";
import { TypeResult } from "../../types";
import { schemaPerPage } from "../../config";

const schemaUserListPayload = z
  .object({
    page: z.number(),
    perPage: schemaPerPage,
    followedByUserId: z.string().optional(),
    followerOfUserId: z.string().optional(),
  })
  .superRefine((schema, ctx) => {
    if (schema.followedByUserId && schema.followerOfUserId) {
      ctx.addIssue({
        code: "custom",
        message: "Pick one from followedByUserId or followerOfUserId",
        path: ["followedByUserId"],
      });
    }
  });
const schemaUserListResponse = z.object({
  totalPages: z.number(),
  nextPage: z.number().nullable(),
  items: z.array(
    z.object({
      userId: z.string(),
      isFollowed: z.boolean(),
      followersCount: z.number(),
      followedCount: z.number(),
      postsCount: z.number(),
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

type TypeUsersWhere = Required<
  Parameters<typeof prismaClient.user.findMany>
>[0]["where"];

const userListHandler = defineHandler(async (payload, req) => {
  let status: number = HttpStatusCode.BAD_REQUEST;
  let responseData: TypeResult<TypeUserListResponse> = {
    isSuccess: false,
    errorMessages: ["Failed to list users"],
  };

  // build query filters
  let userListFilters: TypeUsersWhere = {
    userId: { notIn: [req.userFromToken?.userId || ""] },
  };
  if (payload.followedByUserId) {
    userListFilters = {
      ...userListFilters,
      followers: {
        some: {
          followerId: payload.followedByUserId,
        },
      },
    };
  } else if (payload.followerOfUserId) {
    userListFilters = {
      ...userListFilters,
      followed: {
        some: {
          followedId: payload.followerOfUserId,
        },
      },
    };
  }

  // query database
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
      followed: {
        select: {
          followedId: true,
        },
      },
      posts: {
        select: {
          postId: true,
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
      followedCount: user.followed.length,
      postsCount: user.posts.length,
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
