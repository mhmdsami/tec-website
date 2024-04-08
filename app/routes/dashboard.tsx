import { Business, User } from "@prisma-app/client";
import { json, LoaderFunction, redirect, TypedResponse } from "@remix-run/node";
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
  if (user.isAdmin) return redirect("/dashboard");

  const business = await getBusinessByOwnerId(user.id);
  if (!business) return redirect("/dashboard/onboarding");

  return json({ user, business });
};

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}
