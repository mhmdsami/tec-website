import { LoaderFunction, redirect } from "@remix-run/node";
import { Outlet, useOutletContext } from "@remix-run/react";
import Footer from "~/components/footer";
import Navbar from "~/components/navbar";
import { RootOutletContext } from "~/root";
import { getUserById } from "~/utils/api.server";
import { redirectToBasedOnRole } from "~/utils/helpers.server";
import { requireUserId } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const user = await getUserById(userId);
  if (!user) return redirect("/sign-in");
  const redirectTo = redirectToBasedOnRole(user, "USER");
  if (redirectTo) return redirect(redirectTo);

  return null;
};

export default function Me() {
  const { isLoggedIn } = useOutletContext<RootOutletContext>();

  return (
    <div className="mx-5 flex min-h-screen flex-col sm:mx-10">
      <Navbar isLoggedIn={isLoggedIn} />
      <Outlet />
      <Footer />
    </div>
  );
}
