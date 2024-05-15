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
    <div className="mx-5 flex min-h-screen flex-col sm:mx-10">
      <Navbar isLoggedIn={isLoggedIn} businessTypes={businessTypes} />
      <Outlet />
      <footer className="flex grow items-end">
        <div className="flex w-full items-center justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Tirunelveli Economic Chamber
          </p>
          <img src="/tec.png" alt="TEC Logo" className="w-32" />
        </div>
      </footer>
    </div>
  );
}
