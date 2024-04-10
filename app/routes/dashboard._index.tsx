import { useOutletContext } from "@remix-run/react";
import Profile from "~/components/profile";
import { DashboardOutletContext } from "~/routes/dashboard";

export default function Dashboard() {
  const { business } = useOutletContext<DashboardOutletContext>();

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center overflow-scroll">
      <Profile {...business} showEditButton />
    </main>
  );
}
