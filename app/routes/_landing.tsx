import { BusinessType } from "@prisma-app/client";
import { LoaderFunction, TypedResponse, json } from "@remix-run/node";
import { Outlet, useLoaderData, useOutletContext } from "@remix-run/react";
import Navbar from "~/components/navbar";
import { RootOutletContext } from "~/root";
import { getBusinessTypes } from "~/utils/api.server";

type LoaderData = {
  businessTypes: BusinessType[];
};

export const loader: LoaderFunction = async (): Promise<
  TypedResponse<LoaderData>
> => {
  const businessTypes = await getBusinessTypes();

  return json({ businessTypes });
};

export default function Landing() {
  const { isLoggedIn } = useOutletContext<RootOutletContext>();
  const { businessTypes } = useLoaderData<LoaderData>();

  return (
    <div className="mx-10 flex flex-col">
      <Navbar isLoggedIn={isLoggedIn} businessTypes={businessTypes} />
      <Outlet />
    </div>
  );
}
