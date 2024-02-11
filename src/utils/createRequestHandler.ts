import { Prisma } from "@prisma/client";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError, ZodRawShape, z } from "zod";
import { TypeResult, TypeZodSchema } from "../types";
import sendResponse from "./sendResponse";

const handleInternalError = (error: unknown, req: Request, res: Response) => {
  console.log("#oue297893287" + req.route?.path, error);

  let errorMessage = "Internal error. ";
  let status = 500;
  let details = undefined;

  if (error instanceof ZodError) {
    errorMessage = error?.issues?.[0]?.message;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      status = 409;
    }
    errorMessage = `Prisma error: ${error.code}`;
    details = error;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }
  sendResponse({ res })
    .status(status)
    .json({ isSuccess: false, errorMessages: [errorMessage], details });
};

const validateHandlerResult = <ZodObjResponse extends ZodRawShape>(
  req: Request,
  responseSchema: TypeZodSchema<ZodObjResponse>,
  handlerResult: {
    responseData: TypeResult<z.infer<TypeZodSchema<ZodObjResponse>>>;
    status?: number;
  }
) => {
  // in dev treat bad response shape as error, in prod just log it
  if (handlerResult.responseData.isSuccess) {
    if (process.env.NODE_ENV === "development") {
      responseSchema.parse(handlerResult.responseData.result);
    } else {
      const parseResult = responseSchema.safeParse(
        handlerResult.responseData.result
      );

      if (!parseResult.success) {
        console.error(
          "#iwu28978937",
          handlerResult.responseData,
          req.route?.path,
          parseResult.error.issues
        );
      }
    }
  }
};

function createRequestHandler<
  ZodObjPayload extends ZodRawShape,
  ZodObjResponse extends ZodRawShape
>(
  payloadSchema: TypeZodSchema<ZodObjPayload>,
  responseSchema: TypeZodSchema<ZodObjResponse>
) {
  type TypeCallBack = (
    payload: z.infer<TypeZodSchema<ZodObjPayload>>,
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<{
    responseData: TypeResult<z.infer<TypeZodSchema<ZodObjResponse>>>;
    status?: number;
  }>;

  return (cb: TypeCallBack): RequestHandler => {
    return async (req, res, next) => {
      const _sendResponse = sendResponse<
        z.infer<TypeZodSchema<ZodObjResponse>>
      >({
        res,
      });

      try {
        const parseResult = payloadSchema.safeParse(req.body);

        if (!parseResult.success) {
          return _sendResponse.status(400).json({
            isSuccess: false,
            // errorMessages: parseResult?.error?.errors?.map(
            //   (_error) => "Bad payload. " + _error.message
            // ),
            errorMessages: parseResult?.error?.issues?.map(
              (_error) => _error.message + " (bad payload)"
            ),
            details: parseResult.error.issues,
          });
        }

        const handlerResult = await cb(parseResult.data, req, res, next);

        validateHandlerResult(req, responseSchema, handlerResult);

        _sendResponse
          .status(handlerResult.status)
          .json(handlerResult.responseData);
      } catch (error) {
        handleInternalError(error, req, res);
      }
    };
  };
}

function createGetRequestHandler<ZodObjResponse extends ZodRawShape>(
  responseSchema: TypeZodSchema<ZodObjResponse>
) {
  type TypeCallBack = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<{
    responseData: TypeResult<z.infer<TypeZodSchema<ZodObjResponse>>>;
    status?: number;
  }>;

  return (cb: TypeCallBack): RequestHandler => {
    return async (req, res, next) => {
      const _sendResponse = sendResponse<
        z.infer<TypeZodSchema<ZodObjResponse>>
      >({
        res,
      });

      try {
        const handlerResult = await cb(req, res, next);

        validateHandlerResult(req, responseSchema, handlerResult);

        _sendResponse
          .status(handlerResult.status)
          .json(handlerResult.responseData);
      } catch (error) {
        handleInternalError(error, req, res);
      }
    };
  };
}

export { createGetRequestHandler, createRequestHandler };
