import { NextFunction, Request, Response } from "express";

/** while developing, add fake delay before response so it's easier to test loading states on front-end */
export const addFakeDelayBeforeResponse =
  (env: string) => (req: Request, res: Response, next: NextFunction) => {
    if (env === "development") {
      console.log("adding fake delay");
      setTimeout(() => next(), 200);
    } else {
      next();
    }
  };
