import { z } from "zod";
import { TypeResult } from "../../types";
import { createRequestHandler } from "../../utils/createRequestHandler";
import getPrismaClient from "../../utils/getPrismaClient";
import getEncryptedPassword from "./helpers/getEncryptedPassword";
import HttpStatusCode from "../../utils/httpStatus";
import { generateAuthToken } from "./helpers/authToken";

const schemaAuthSignInPayload = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email" }),
  password: z
    .string({ required_error: "Password is required." })
    .min(8, { message: "Password should be of 8 characters atleast." }),
});

const schemaAuthSignInResponse = z.object({
  name: z.string(),
  userId: z.string(),
  authToken: z.string(),
  authTokenExpiresAtMs: z.number(),
});

type TypeSignInResponse = z.infer<typeof schemaAuthSignInResponse>;

const defineHandler = createRequestHandler(
  schemaAuthSignInPayload,
  schemaAuthSignInResponse
);

const prisma = getPrismaClient();

const authSignInHandler = defineHandler(async (payload) => {
  let status: number = HttpStatusCode.UNAUTHORIZED;
  let responseData: TypeResult<TypeSignInResponse> = {
    isSuccess: false,
    errorMessages: ["Invalid credentials"],
  };

  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    return { responseData, status };
  }

  const payloadEncryptedPassword = getEncryptedPassword({
    plainPassword: payload.password,
    salt: user.salt,
  });

  if (payloadEncryptedPassword !== user.encryptedPassword) {
    return { responseData, status };
  }

  const { authToken, authTokenExpiresAtMs } = generateAuthToken({
    userId: user.userId,
  });

  status = 200;
  responseData = {
    isSuccess: true,
    result: {
      userId: user.userId,
      name: user.name,
      authToken,
      authTokenExpiresAtMs,
    },
  };

  return { responseData, status };
});

export default authSignInHandler;
