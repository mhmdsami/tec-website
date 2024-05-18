import { Link, useOutletContext } from "@remix-run/react";
import { addYears } from "date-fns";
import Profile from "~/components/profile";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { DashboardOutletContext } from "~/routes/dashboard";

export default function Dashboard() {
  const { business } = useOutletContext<DashboardOutletContext>();

  return (
    <main className="flex w-full grow flex-col items-center justify-center overflow-scroll">
      <Profile {...business}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="self-end">
              <Badge className="h-fit w-fit hover:bg-primary">
                {addYears(business.createdAt, 1).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Validity</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button>
          <Link to="/dashboard/edit">Edit</Link>
        </Button>
      </Profile>
    </main>
  );
}
