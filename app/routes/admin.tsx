import { LoaderFunction, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import Sidebar from "~/components/sidebar";
import siteConfig from "~/site.config";
import { getUserById } from "~/utils/api.server";
import { requireUserId } from "~/utils/session.server";

export const meta = () => [
  { title: `${siteConfig.name} | Admin` },
  { name: "description", content: siteConfig.description },
];

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const user = await getUserById(userId);
  if (!user) return redirect("/sign-in");
  if (!user.isAdmin) return redirect("/dashboard");

  return null;
};

export default function Admin() {
  return (
    <>
      <Sidebar isAdmin />
      <main className="p-5 sm:p-10 sm:ml-14">
        <Outlet />
      </main>
    </>
  );
}
