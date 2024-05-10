import { Prisma } from "@prisma-app/client";

export const errorHandler = (e: Error) => {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002") {
      return {
        status: 400,
        message: e.message,
      };
    } else if (e.code === "P2025") {
      return {
        status: 404,
        message: e.message,
      };
    }
  }

  return {
    status: 500,
    message: "Internal server error",
  };
};
