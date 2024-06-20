import { LoaderFunction, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import Sidebar from "~/components/sidebar";
import siteConfig from "~/site.config";
import { db } from "~/utils/db.server";
import { redirectToBasedOnRole } from "~/utils/helpers.server";
import { requireUserId } from "~/utils/session.server";

export const meta = () => [
  { title: `${siteConfig.name} | Admin` },
  { name: "description", content: siteConfig.description },
];

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return redirect("/sign-in");
  const redirectTo = redirectToBasedOnRole(user, "ADMIN");
  if (redirectTo) return redirect(redirectTo);

  return null;
};

export default function Admin() {
  return (
    <>
      <Sidebar isAdmin />
      <main className="p-5 sm:ml-14 sm:p-10">
        <Outlet />
      </main>
    </>
  );
}
