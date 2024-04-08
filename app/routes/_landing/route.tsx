import { Outlet } from "@remix-run/react";
import Navbar from "~/routes/_landing/secondary-navbar";

export default function Landing() {
  return (
    <div className="flex flex-col">
      <Navbar />
      <Outlet />
    </div>
  );
}
