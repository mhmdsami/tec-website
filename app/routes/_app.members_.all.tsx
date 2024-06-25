import {
  Business,
  BusinessCategory,
  BusinessType,
  User,
} from "@prisma-app/client";
import { LoaderFunction, TypedResponse, json } from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { useState } from "react";
import BusinessCard from "~/components/cards/business-card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { AppOutletContext } from "~/routes/_app";
import { db } from "~/utils/db.server";

type LoaderData = {
  businessCategories: Array<BusinessCategory & { types: BusinessType[] }>;
  businesses: Array<Business & { owner: User }>;
};

export const loader: LoaderFunction = async ({
  params,
}): Promise<TypedResponse<LoaderData>> => {
  const businessCategories = await db.businessCategory.findMany({
    include: { types: true },
  });
  const businesses = await db.business.findMany({
    where: { isVerified: true },
    include: { owner: true },
  });

  return json({ businessCategories, businesses });
};

export default function MembersAll() {
  const { businessCategories } = useOutletContext<AppOutletContext>();
  const { businesses: data } = useLoaderData<LoaderData>();
  const businessTypes = businessCategories.flatMap((category) =>
    category.types.map((type) => ({
      ...type,
      category: category.name,
      categorySlug: category.slug,
    })),
  );

  const [businesses, setBusinesses] = useState(data);
  const [category, setCategory] = useState<string>("all");

  const handleCategoryFilterChange = (category: string) => {
    setCategory(category);
    if (category === "all") {
      setBusinesses(data);
      return;
    }

    const types = businessCategories
      .find((c) => c.slug === category)
      ?.types.map((t) => t.id);
    if (!types) return;

    const filteredBusinesses = data.filter((business) =>
      types.includes(business.typeId),
    );
    setBusinesses(filteredBusinesses);
  };

  const handleTypeFilterChange = (type: string) => {
    if (category === "all") return;

    const typeId = businessTypes.find((bt) => bt.slug === type)?.id;
    if (!typeId) return;

    const filteredBusinesses = data.filter(
      (business) => business.typeId === typeId,
    );
    setBusinesses(filteredBusinesses);
  };

  return (
    <main className="flex flex-col gap-5">
      <div className="flex flex-row flex-wrap items-center justify-between gap-2">
        <div className="flex w-full flex-row flex-wrap items-center gap-2 sm:w-fit">
          <Input
            name="name"
            placeholder="Search by name"
            className="w-full sm:w-[250px]"
            onChange={(e) => {
              const value = e.target.value.toLowerCase();
              setBusinesses(
                businesses.filter((business) =>
                  business.name.toLowerCase().includes(value),
                ),
              );
            }}
          />
        </div>
        <div className="flex w-full flex-row flex-wrap items-center gap-2 sm:w-fit">
          <Select onValueChange={handleCategoryFilterChange} defaultValue="all">
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {businessCategories.map(({ slug, name }) => (
                <SelectItem key={slug} value={slug}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={handleTypeFilterChange}
            defaultValue="all"
            disabled={category === "all"}
          >
            <SelectTrigger className="w-full sm:w-[250px]" defaultValue="all">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {businessCategories
                .find((c) => c.slug === category)
                ?.types.map(({ slug, name }) => (
                  <SelectItem key={slug} value={slug}>
                    {name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {businesses.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {businesses.map(({ owner: { name }, typeId, ...business }, idx) => (
            <BusinessCard {...business} owner={name} />
          ))}
        </div>
      ) : (
        <p>No businesses found</p>
      )}
    </main>
  );
}
