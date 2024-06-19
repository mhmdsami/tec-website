import { BusinessCategory, BusinessType } from "@prisma-app/client";
import { LoaderFunction, TypedResponse, json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import Footer from "~/components/footer";
import Navbar from "~/components/navbar";
import { getBusinessCategoryWithTypes } from "~/utils/api.server";
import { getUserId } from "~/utils/session.server";

type LoaderData = {
  isLoggedIn: boolean;
  businessCategories: Array<BusinessCategory & { types: BusinessType[] }>;
};

export const loader: LoaderFunction = async ({
  request,
}): Promise<TypedResponse<LoaderData>> => {
  const isLoggedIn = !!(await getUserId(request));
  const businessCategories = await getBusinessCategoryWithTypes();

  return json({ isLoggedIn, businessCategories });
};

export type AppOutletContext = {
  isLoggedIn: boolean;
  businessCategories: Array<BusinessCategory & { types: BusinessType[] }>;
};

export default function App() {
  const { businessCategories, isLoggedIn } = useLoaderData<LoaderData>();

  return (
    <div className="mx-5 flex min-h-screen flex-col sm:mx-10">
      <Navbar isLoggedIn={isLoggedIn} />
      <Outlet
        context={{ isLoggedIn, businessCategories } as AppOutletContext}
      />
      <Footer />
    </div>
  );
}
