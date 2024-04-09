import { Outlet, useOutletContext } from "@remix-run/react";
import Navbar from "~/components/navbar";
import { RootOutletContext } from "~/root";

export default function Landing() {
  const { isLoggedIn } = useOutletContext<RootOutletContext>();

  return (
    <div className="mx-10 flex flex-col">
      <Navbar isLoggedIn={isLoggedIn} />
      <Outlet />
    </div>
  );
}
