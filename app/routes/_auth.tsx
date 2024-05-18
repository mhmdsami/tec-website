import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { Link, Outlet } from "@remix-run/react";
import { getUserId } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) {
    return redirect("/");
  }

  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) {
    return redirect("/");
  }

  return null;
};

export default function Auth() {
  return (
    <>
      <nav className="mx-5 flex h-20 items-center sm:mx-10">
        <Link to="/" className="text-3xl font-bold text-primary">
          <img src="/logomark.png" alt="TEC Logo" className="h-12 w-12" />
        </Link>
      </nav>
      <Outlet />
    </>
  );
}
