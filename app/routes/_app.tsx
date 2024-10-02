import { BusinessCategory, BusinessType, User } from "@prisma-app/client";
import { LoaderFunction, TypedResponse, json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import Footer from "~/components/footer";
import Navbar from "~/components/navbar";
import { db } from "~/utils/db.server";
import { getUserId } from "~/utils/session.server";

type LoaderData = {
  businessCategories: Array<BusinessCategory & { types: BusinessType[] }>;
} & (
  | {
      isLoggedIn: false;
      user: null;
    }
  | {
      isLoggedIn: true;
      user: Pick<User, "name" | "email" | "type">;
    }
);

export const loader: LoaderFunction = async ({
  request,
}): Promise<TypedResponse<LoaderData>> => {
  const businessCategories = await db.businessCategory.findMany({
    include: { types: true },
  });

  const userId = await getUserId(request);
  if (!userId) {
    return json({ isLoggedIn: false, businessCategories, user: null });
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    return json({ isLoggedIn: false, businessCategories, user: null });
  }

  return json({ isLoggedIn: true, user, businessCategories });
};

export type AppOutletContext = LoaderData;

export default function App() {
  const { businessCategories, isLoggedIn, user } = useLoaderData<LoaderData>();

  return (
    <div className="mx-5 flex min-h-screen flex-col sm:mx-10">
      <Navbar isLoggedIn={isLoggedIn} />
      <Outlet
        context={{ isLoggedIn, businessCategories, user } as AppOutletContext}
      />
      <Footer />
    </div>
  );
}
