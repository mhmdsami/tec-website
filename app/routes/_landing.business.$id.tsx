import { Business } from "@prisma-app/client";
import { json, LoaderFunction, TypedResponse } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Profile from "~/components/profile";
import { getBusinessById } from "~/utils/api.server";

type LoaderData = {
  business: Business;
};

export const loader: LoaderFunction = async ({
  params,
}): Promise<TypedResponse<LoaderData>> => {
  const id = params.id;

  if (!id) {
    throw json({ message: "Business id not found" }, { status: 400 });
  }

  const business = await getBusinessById(id);

  if (!business) {
    throw json({ message: "Business not found" }, { status: 404 });
  }

  return json({ business });
};

export default function BusinessProfile() {
  const { business } = useLoaderData<LoaderData>();

  return (
    <main className="flex h-[80vh] w-full flex-col items-center justify-center overflow-scroll">
      <Profile {...business} />
    </main>
  );
}
