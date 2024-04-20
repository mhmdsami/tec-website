import { TypedResponse } from "@remix-run/node";

export type ActionData = {
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export type ActionResponse = Promise<TypedResponse<ActionData>>;

type ApiResponse<T> = Promise<
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
      data: T;
    }
>;
