import { json, LoaderFunction, TypedResponse } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { BadgeCheck, Building, Calendar, CircleHelp, CirclePlus } from "lucide-react";
import { StatsCard } from "~/components/cards";
import { Button } from "~/components/ui/button";
import siteConfig from "~/site.config";
import { db } from "~/utils/db.server";

type LoaderData = {
  numberOfBusinesses: number;
  numberOfVerifiedBusinesses: number;
  numberOfBusinessTypes: number;
  numberOfEnquiries: number;
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
  const numberOfBusinesses = await db.business.count();
  const numberOfVerifiedBusinesses = await db.business.count({
    where: { isVerified: true },
  });
  const numberOfBusinessTypes = await db.businessType.count();
  const numberOfEnquiries = await db.contact.count();
  const numberOfEvents = await db.event.count();
  const numberOfBlogs = await db.blog.count();

  return json({
    numberOfBusinesses,
    numberOfVerifiedBusinesses,
    numberOfBusinessTypes,
    numberOfEnquiries,
    numberOfEvents,
    numberOfBlogs,
  });
};

export default function Admin() {
  const {
    numberOfBusinesses,
    numberOfVerifiedBusinesses,
    numberOfBusinessTypes,
    numberOfEnquiries,
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
          <Link to="/admin/businesses" prefetch="intent">
            View Businesses
          </Link>
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
          <Link to="/admin/verification" prefetch="intent">
            Verify Business
          </Link>
        </Button>
      </StatsCard>
      <StatsCard
        title="Business Types"
        description="Manage business types"
        value={numberOfBusinessTypes}
        Icon={CirclePlus}
      >
        <Button className="self-end">
          <Link to="/admin/manage" prefetch="intent">
            Manage Business Types
          </Link>
        </Button>
      </StatsCard>
      <StatsCard
        title="Enqiuries"
        description="Contact us enquiries"
        value={numberOfEnquiries}
        Icon={CircleHelp}
      >
        <Button className="self-end">
          <Link to="/admin/enquiries" prefetch="intent">
            View Enquiries
          </Link>
        </Button>
      </StatsCard>
      <StatsCard
        title="Events"
        description="Add or update events"
        value={numberOfEvents}
        Icon={Calendar}
      >
        <Button className="self-end">
          <Link to="/admin/events" prefetch="intent">
            Manage Events
          </Link>
        </Button>
      </StatsCard>
      <StatsCard
        title="Blogs"
        description="Create new blog"
        value={numberOfBlogs}
        Icon={Building}
      >
        <Button className="self-end">
          <Link to="/admin/blog" prefetch="intent">
            Manage Blog
          </Link>
        </Button>
      </StatsCard>
    </div>
  );
}
