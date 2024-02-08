import { z } from "zod";
import { v4 as uuid } from "uuid";
import { TypeResult } from "../../types";
import { createRequestHandler } from "../../utils/createRequestHandler";
import getPrismaClient from "../../utils/getPrismaClient";
import getEncryptedPassword from "./helpers/getEncryptedPassword";
import { generateAuthToken } from "./helpers/authToken";
import { Prisma } from "@prisma/client";
import HttpStatusCode from "../../utils/httpStatus";

const schemaAuthSignUpPayload = z.object({
  name: z
    .string({ required_error: "Name is required." })
    .min(3, { message: "Name should be of 3 characters atleast." }),
  password: z
    .string({ required_error: "Password is required." })
    .min(8, { message: "Password should be of 8 characters atleast." }),
});

const schemaAuthSignUpResponse = z.object({
  name: z.string(),
  userId: z.string(),
  authToken: z.string(),
  authTokenExpiresAtMs: z.number(),
});

type TypeSignUpResponse = z.infer<typeof schemaAuthSignUpResponse>;

const prismaClient = getPrismaClient();

const defineHandler = createRequestHandler(
  schemaAuthSignUpPayload,
  schemaAuthSignUpResponse
);

const authSignUpHandler = defineHandler(async (payload) => {
  let status: number = HttpStatusCode.OK;
  let responseData: TypeResult<TypeSignUpResponse>;

  const { name, password } = payload;

  const salt = uuid();

  const encryptedPassword = getEncryptedPassword({
    plainPassword: password,
    salt,
  });

  try {
    const createdUser = await prismaClient.user.create({
      data: {
        name,
        salt,
        encryptedPassword,
      },
    });
    const { authToken, authTokenExpiresAtMs } = generateAuthToken({
      userId: createdUser.userId,
    });

    responseData = {
      isSuccess: true,
      result: {
        userId: createdUser.userId,
        name: createdUser.name,
        authToken,
        authTokenExpiresAtMs,
      },
    };
  } catch (error) {
    status = HttpStatusCode.INTERNAL_SERVER_ERROR;
    responseData = {
      isSuccess: false,
      errorMessages: ["Failed to sign-up"],
      details: error,
    };

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      status = HttpStatusCode.CONFLICT;
      responseData = {
        isSuccess: false,
        errorMessages: ["User already exists"],
        details: error,
      };
    }
  }

  return { responseData, status };
});

export default authSignUpHandler;
