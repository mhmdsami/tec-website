import { LoaderFunction, redirect } from "@remix-run/node";
import { Link, Outlet } from "@remix-run/react";
import { getUserId } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) {
    return redirect("/");
  }

  return null;
};

export default function Auth() {
  return (
    <>
      <nav className="mx-10 flex h-20 items-center">
        <Link to="/" className="text-3xl font-bold text-primary">
          TEC
        </Link>
      </nav>
      <Outlet />
    </>
  );
}
