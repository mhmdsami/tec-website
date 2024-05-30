import { BusinessType } from "@prisma-app/client";
import { json, LoaderFunction, TypedResponse } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import useWindowSize from "~/hooks/use-window-size";
import { getBusinessTypes } from "~/utils/api.server";

type LoaderData = {
  businessTypes: BusinessType[];
};

export const loader: LoaderFunction = async (): Promise<
  TypedResponse<LoaderData>
> => {
  const businessTypes = await getBusinessTypes();

  return json({ businessTypes });
};

function generateGrid(
  types: Array<BusinessType>,
  rowSize: [number, number] = [5, 4],
) {
  let grid: BusinessType[][] = [];
  let counter = 0;

  types = [...types, { id: "all", name: "All", slug: "all" }];

  while (types.length > 0) {
    let size = counter % 2 === 0 ? rowSize[0] : rowSize[1];
    grid.push(types.splice(0, size));
    counter++;
  }

  return grid;
}

export default function Members() {
  const { businessTypes } = useLoaderData<LoaderData>();
  const { width } = useWindowSize();

  const grid = generateGrid(businessTypes, width > 768 ? [5, 4] : [2, 1]);

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
              to={`/members/${slug}`}
              className="hexagon flex h-32 w-28 items-center justify-center bg-secondary transition-all duration-300 hover:bg-primary hover:text-white"
            >
              {name}
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}
