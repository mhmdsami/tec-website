import { Link, useOutletContext } from "@remix-run/react";
import useMediaQuery from "~/hooks/use-media-query";
import { AppOutletContext } from "~/routes/_app";
import { generateGrid, makeNameDisplayable } from "~/utils/helpers";

export default function Members() {
  const { businessCategories } = useOutletContext<AppOutletContext>();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const categories = businessCategories.map(({ name, slug }) => ({
    name,
    slug,
  }));

  const grid = generateGrid(categories, isDesktop ? [5, 4] : [2, 1], {
    name: "All",
    slug: "all",
  });

  return (
    <div className="mx-auto flex min-h-[80vh] flex-col justify-center overflow-clip pb-24">
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
              to={`/members/${slug}`}
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
