import { ZodEffects, ZodObject, ZodRawShape } from "zod";

export type TypeResult<T> =
  | { isSuccess: true; result: T }
  | { isSuccess: false; errorMessages: string[]; details?: any };

// to extract zod schema's types while building abstractions
export type TypeZodSchema<ZodObj extends ZodRawShape> =
  | ZodObject<ZodObj>
  | ZodEffects<ZodObject<ZodObj>>;
