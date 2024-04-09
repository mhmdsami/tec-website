import { Outlet, useOutletContext } from "@remix-run/react";
import { RootOutletContext } from "~/root";
import Navbar from "~/routes/_landing/navbar";

export default function Landing() {
  const { isLoggedIn } = useOutletContext<RootOutletContext>();

  return (
    <div className="mx-10 flex flex-col">
      <Navbar isLoggedIn={isLoggedIn} />
      <Outlet />
    </div>
  );
}
