import { json, LoaderFunction, TypedResponse } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { BadgeCheck, Building } from "lucide-react";
import StatsCard from "~/components/stats-card";
import { Button } from "~/components/ui/button";
import siteConfig from "~/site.config";
import {
  getNumberOfBusinesses,
  getNumberOfVerifiedBusinesses,
} from "~/utils/api.server";

type LoaderData = {
  numberOfBusinesses: number;
  numberOfVerifiedBusinesses: number;
};

export const meta = () => [
  { title: `${siteConfig.name} | Admin` },
  { name: "description", content: siteConfig.description },
];

export const loader: LoaderFunction = async (): Promise<
  TypedResponse<LoaderData>
> => {
  const numberOfBusinesses = await getNumberOfBusinesses();
  const numberOfVerifiedBusinesses = await getNumberOfVerifiedBusinesses();

  return json({
    numberOfBusinesses,
    numberOfVerifiedBusinesses,
  });
};

export default function Admin() {
  const { numberOfBusinesses, numberOfVerifiedBusinesses } =
    useLoaderData<LoaderData>();

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Businesses"
        description="Total number of businesses on the platform"
        value={numberOfBusinesses}
        Icon={Building}
      >
        <Button className="self-end">
          <Link to="/admin/businesses">View Businesses</Link>
        </Button>
      </StatsCard>
      <StatsCard
        title="Verified Businesses"
        description="Total number of verified businesses on the platform"
        value={numberOfVerifiedBusinesses}
        total={numberOfBusinesses}
        Icon={BadgeCheck}
      >
        <Button className="self-end">
          <Link to="/admin/verification">Verify Business</Link>
        </Button>
      </StatsCard>
    </div>
  );
}
