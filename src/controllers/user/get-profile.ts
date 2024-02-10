import { z } from "zod";
import getPrismaClient from "../../utils/getPrismaClient";
import { createRequestHandler } from "../../utils/createRequestHandler";
import HttpStatusCode from "../../utils/httpStatus";
import { TypeResult } from "../../types";

const schemaUserGetProfilePayload = z.object({});

const schemaUserGetProfileResponse = z.object({
  userId: z.string(),
  name: z.string(),
  postsCount: z.number(),
  followingCount: z.number(),
  followersCount: z.number(),
});

type TypeUserGetProfileResponse = z.infer<typeof schemaUserGetProfileResponse>;

const prismaClient = getPrismaClient();

const defineHandler = createRequestHandler(
  schemaUserGetProfilePayload,
  schemaUserGetProfileResponse
);

const userGetProfileHandler = defineHandler(async (payload, req) => {
  let status: number = HttpStatusCode.BAD_REQUEST;
  let responseData: TypeResult<TypeUserGetProfileResponse> = {
    isSuccess: false,
    errorMessages: ["Failed to get profile"],
  };
  const userId = req.userFromToken?.userId || "";

  const user = await prismaClient.user.findUnique({
    where: { userId },

    select: {
      name: true,
      userId: true,

      followers: { select: { followerId: true } },

      following: { select: { followingId: true } },

      posts: { select: { postId: true } },
    },
  });

  if (!user) {
    status = HttpStatusCode.NOT_FOUND;
    responseData.errorMessages = ["User not found"];
    return { responseData, status };
  }

  status = HttpStatusCode.OK;
  responseData = {
    isSuccess: true,
    result: {
      userId: user.userId,
      name: user.name,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      postsCount: user.posts.length,
    },
  };

  return { responseData, status };
});

export default userGetProfileHandler;
