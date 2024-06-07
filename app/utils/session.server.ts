import type { User, UserType } from "@prisma-app/client";
import {
  createCookie,
  createCookieSessionStorage,
  redirect,
} from "@remix-run/node";
import bcrypt from "bcryptjs";
import siteConfig from "~/site.config";
import { db } from "~/utils/db.server";
import { SESSION_SECRET } from "~/utils/env.server";

export async function signUp(
  email: string,
  name: string,
  type: UserType,
  password: string,
): Promise<
  { success: true; data: { user: User } } | { success: false; error: string }
> {
  const existingUser = await db.user.findFirst({
    where: { email },
  });

  if (existingUser) {
    return { success: false, error: "User already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: { email, name, type, passwordHash },
  });

  return { success: true, data: { user: user as User } };
}

export async function signIn(
  email: string,
  password: string,
): Promise<
  { success: false; error: string } | { success: true; data: { user: User } }
> {
  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordsMatch) {
    return { success: false, error: "Incorrect password" };
  }

  return { success: true, data: { user: user as User } };
}

const { commitSession, getSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: siteConfig.sessionName,
      secure: true,
      secrets: [SESSION_SECRET],
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
    },
  });

export const redirectToCookie = createCookie("redirect_to", {
  secure: true,
  secrets: [SESSION_SECRET],
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 2,
  httpOnly: true,
});

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await getSession();
  session.set("userId", userId);

  const headers = new Headers();
  headers.append("Set-Cookie", await commitSession(session));
  headers.append(
    "Set-Cookie",
    await redirectToCookie.serialize(null, { maxAge: 1 }),
  );

  return redirect(redirectTo, { headers });
}

function getUserSession(request: Request) {
  return getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");

  if (typeof userId !== "string") return null;
  return userId;
}

export async function requireUserId(request: Request, redirectTo?: string) {
  const userId = await getUserId(request);

  if (!userId) {
    throw redirect("/sign-in", {
      headers: {
        "Set-Cookie": await redirectToCookie.serialize(redirectTo),
      },
    });
  }
  return userId;
}

export async function signOut(request: Request) {
  const session = await getUserSession(request);

  const headers = new Headers();
  headers.append("Set-Cookie", await destroySession(session));
  headers.append(
    "Set-Cookie",
    await redirectToCookie.serialize(null, { maxAge: 1 }),
  );

  return redirect("/", { headers });
}
