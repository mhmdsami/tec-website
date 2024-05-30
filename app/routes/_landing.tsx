import { Outlet, useOutletContext } from "@remix-run/react";
import Footer from "~/components/footer";
import Navbar from "~/components/navbar";
import { RootOutletContext } from "~/root";

export default function Landing() {
  const { isLoggedIn } = useOutletContext<RootOutletContext>();

  return (
    <div className="mx-5 flex min-h-screen flex-col sm:mx-10">
      <Navbar isLoggedIn={isLoggedIn} />
      <Outlet />
      <Footer />
    </div>
  );
}
