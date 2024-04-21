import { Link, useOutletContext } from "@remix-run/react";
import Profile from "~/components/profile";
import { Button } from "~/components/ui/button";
import { DashboardOutletContext } from "~/routes/dashboard";

export default function Dashboard() {
  const { business } = useOutletContext<DashboardOutletContext>();

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center overflow-scroll">
      <Profile {...business}>
        <Button>
          <Link to="/dashboard/edit">Edit</Link>
        </Button>
      </Profile>
    </main>
  );
}
