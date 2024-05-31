import { Business, User } from "@prisma-app/client";
import { LoaderFunction, TypedResponse, json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import Sidebar from "~/components/sidebar";
import siteConfig from "~/site.config";
import { getBusinessByOwnerId, getUserById } from "~/utils/api.server";
import { requireUserId } from "~/utils/session.server";

export const meta = () => [
  { title: `${siteConfig.name} | Dashboard` },
  { name: "description", content: siteConfig.description },
];

type LoaderData = {
  user: User;
  business: Business;
};

export const loader: LoaderFunction = async ({
  request,
}): Promise<TypedResponse<LoaderData>> => {
  const userId = await requireUserId(request);

  const user = await getUserById(userId);
  if (!user) return redirect("/sign-in");
  if (user.isAdmin) return redirect("/admin");

  const business = await getBusinessByOwnerId(user.id);
  if (!business) return redirect("/dashboard/onboarding");

  return json({ user, business });
};

export type DashboardOutletContext = {
  user: User;
  business: Business;
};

export default function Dashboard() {
  const { user, business } = useLoaderData<LoaderData>();

  return (
    <>
      <Sidebar />
      <main className="flex min-h-screen sm:ml-14 sm:p-10">
        <Outlet
          context={{ user, business } as unknown as DashboardOutletContext}
        />
      </main>
    </>
  );
}
