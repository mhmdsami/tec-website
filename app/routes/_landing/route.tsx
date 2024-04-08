import Navbar from "~/routes/_landing/secondary-navbar";
import { Outlet } from "@remix-run/react";

export default function Landing() {
  return (
    <div className="flex flex-col">
      <Navbar />
      <Outlet />
    </div>
  );
}
