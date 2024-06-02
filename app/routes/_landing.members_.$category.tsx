import { BusinessCategory, BusinessType } from "@prisma-app/client";
import { LoaderFunction, TypedResponse, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import useWindowSize from "~/hooks/use-window-size";
import { getBusinessCategoryWithTypeBySlug } from "~/utils/api.server";
import { generateGrid } from "~/utils/helpers";

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

  const businessCategory = await getBusinessCategoryWithTypeBySlug(category);
  if (!businessCategory) {
    throw json({ message: "Invalid business category" }, { status: 404 });
  }

  return json({ withType: false, businessCategory });
};

export default function Members() {
  const { width } = useWindowSize();
  const {
    businessCategory: { types, slug: categorySlug },
  } = useLoaderData<LoaderData>();

  const grid = generateGrid(
    types.map(({ id, name, slug }) => ({ id, name, slug })),
    width > 768 ? [5, 4] : [2, 1],
  );

  return (
    <div className="mx-auto flex min-h-[70vh] flex-col justify-center">
      {grid.map((row, idx) => (
        <div
          key={idx}
          className="flex gap-4"
          style={{
            transform:
              idx % 2 ? `translate(${idx * 3.5}rem, 3rem)` : "translateY(3rem)",
          }}
        >
          {row.map(({ name, slug }) => (
            <Link
              key={slug}
              to={`/members/${categorySlug}/${slug}`}
              className="hexagon line-clamp-3 flex h-32 w-28 items-center justify-center bg-secondary text-center transition-all duration-300 hover:bg-primary hover:text-white"
            >
              {name}
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}
