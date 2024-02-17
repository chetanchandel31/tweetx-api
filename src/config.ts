import { z } from "zod";

export const config = {
  postContentMaxLength: 240,
} as const;

export const schemaPerPage = z
  .number()
  .min(1, {
    message: "per-page shouldn't be less than 1",
  })
  .max(100, { message: "per-page should be less than 100" });
