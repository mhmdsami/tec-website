import { LoaderFunction, TypedResponse, json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import Footer from "~/components/footer";
import Navbar from "~/components/navbar";
import { getUserId } from "~/utils/session.server";

type LoaderData = {
  isLoggedIn: boolean;
};

export const loader: LoaderFunction = async ({
  request,
}): Promise<TypedResponse<LoaderData>> => {
  const isLoggedIn = !!(await getUserId(request));

  return json({ isLoggedIn });
};

export type AppOutletContext = {
  isLoggedIn: boolean;
};

export default function App() {
  const { isLoggedIn } = useLoaderData<LoaderData>();

  return (
    <div className="mx-5 flex min-h-screen flex-col sm:mx-10">
      <Navbar isLoggedIn={isLoggedIn} />
      <Outlet context={{ isLoggedIn } as AppOutletContext} />
      <Footer />
    </div>
  );
}
