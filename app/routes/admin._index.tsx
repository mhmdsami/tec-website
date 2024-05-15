import { json, LoaderFunction, TypedResponse } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { BadgeCheck, Building, Calendar, CirclePlus } from "lucide-react";
import { StatsCard } from "~/components/cards";
import { Button } from "~/components/ui/button";
import siteConfig from "~/site.config";
import {
  getNumberOfBlogs,
  getNumberOfBusinesses,
  getNumberOfBusinessTypes,
  getNumberOfEvents,
  getNumberOfVerifiedBusinesses,
} from "~/utils/api.server";

type LoaderData = {
  numberOfBusinesses: number;
  numberOfVerifiedBusinesses: number;
  numberOfBusinessTypes: number;
  numberOfEvents: number;
  numberOfBlogs: number;
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
  const numberOfBusinessTypes = await getNumberOfBusinessTypes();
  const numberOfEvents = await getNumberOfEvents();
  const numberOfBlogs = await getNumberOfBlogs();

  return json({
    numberOfBusinesses,
    numberOfVerifiedBusinesses,
    numberOfBusinessTypes,
    numberOfEvents,
    numberOfBlogs,
  });
};

export default function Admin() {
  const {
    numberOfBusinesses,
    numberOfVerifiedBusinesses,
    numberOfBusinessTypes,
    numberOfEvents,
    numberOfBlogs,
  } = useLoaderData<LoaderData>();

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Businesses"
        description="Total number of businesses"
        value={numberOfBusinesses}
        Icon={Building}
      >
        <Button className="self-end">
          <Link to="/admin/businesses">View Businesses</Link>
        </Button>
      </StatsCard>
      <StatsCard
        title="Verified Businesses"
        description="Manage business verification"
        value={numberOfVerifiedBusinesses}
        total={numberOfBusinesses}
        Icon={BadgeCheck}
      >
        <Button className="self-end">
          <Link to="/admin/verification">Verify Business</Link>
        </Button>
      </StatsCard>
      <StatsCard
        title="Business Types"
        description="Manage business types"
        value={numberOfBusinessTypes}
        Icon={CirclePlus}
      >
        <Button className="self-end">
          <Link to="/admin/manage/type">Manage Business Types</Link>
        </Button>
      </StatsCard>
      <StatsCard
        title="Events"
        description="Add or update events"
        value={numberOfEvents}
        Icon={Calendar}
      >
        <Button className="self-end">
          <Link to="/admin/events">Manage Events</Link>
        </Button>
      </StatsCard>
      <StatsCard
        title="Blogs"
        description="Create new blog"
        value={numberOfBlogs}
        Icon={Building}
      >
        <Button className="self-end">
          <Link to="/admin/blog">Manage Blog</Link>
        </Button>
      </StatsCard>
    </div>
  );
}
