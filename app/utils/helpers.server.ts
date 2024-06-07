import type { User, UserType } from "@prisma-app/client";

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
