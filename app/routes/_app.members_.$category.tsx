import { BusinessCategory, BusinessType } from "@prisma-app/client";
import { LoaderFunction, TypedResponse, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import useMediaQuery from "~/hooks/use-media-query";
import { db } from "~/utils/db.server";
import { generateGrid, makeNameDisplayable } from "~/utils/helpers";

type LoaderData = {
  withType: false;
  businessCategory: BusinessCategory & { types: BusinessType[] };
};

export const loader: LoaderFunction = async ({
  params,
}): Promise<TypedResponse<LoaderData>> => {
  const category = params.category;
  if (!category) {
    throw json({ message: "Category not found" }, { status: 400 });
  }

  const businessCategory = await db.businessCategory.findUnique({
    where: { slug: category },
    include: { types: true },
  });
  if (!businessCategory) {
    throw json({ message: "Invalid business category" }, { status: 404 });
  }

  return json({ withType: false, businessCategory });
};

export default function Members() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const {
    businessCategory: { types, slug: categorySlug },
  } = useLoaderData<LoaderData>();

  const grid = generateGrid(
    types.map(({ id, name, slug }) => ({ id, name, slug })),
    isDesktop ? [5, 4] : [2, 1],
  );

  return (
    <div className="mx-auto flex min-h-[70vh] flex-col justify-center overflow-clip pb-24">
      {grid.map((row, idx) => (
        <div
          key={idx}
          className="flex gap-4"
          style={{
            transform:
              idx % 2
                ? `translateX(${isDesktop ? idx * 4 : 4}rem)`
                : "translateY(0.5rem)",
          }}
        >
          {row.map(({ name, slug }) => (
            <Link
              key={slug}
              to={`/members/${categorySlug}/${slug}`}
              className="hexagon line-clamp-3 flex h-32 w-28 items-center justify-center bg-secondary text-center text-sm transition-all duration-300 hover:bg-primary hover:text-white"
            >
              {makeNameDisplayable(name)}
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}
