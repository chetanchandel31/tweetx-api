import { Response } from "express";
import { TypeResult } from "../types";

type Params = { res: Response };

export default function sendResponse<T>({ res }: Params) {
  let _status = 200;

  const api = {
    status: (statusCode: number | undefined) => {
      if (statusCode) _status = statusCode;

      return api;
    },
    json: (json: TypeResult<T>) => {
      return res.status(_status).json(json);
    },
  };

  return api;
}
