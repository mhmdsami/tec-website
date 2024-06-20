import { Prisma, type User, type UserType } from "@prisma-app/client";

export const redirectToBasedOnRole = (user: User, skip?: UserType) => {
  if (skip !== "ADMIN" && user.isAdmin) {
    return "/admin";
  }

  if (skip !== "BUSINESS" && user.type === "BUSINESS") {
    return "/dashboard";
  }

  if (skip !== "USER" && user.type === "USER") {
    return "/me";
  }
};

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
