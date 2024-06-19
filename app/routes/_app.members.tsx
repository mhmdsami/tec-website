import { Link, useOutletContext } from "@remix-run/react";
import useWindowSize from "~/hooks/use-window-size";
import { AppOutletContext } from "~/routes/_app";
import { generateGrid } from "~/utils/helpers";

export default function Members() {
  const { businessCategories } = useOutletContext<AppOutletContext>();
  const { width } = useWindowSize();

  const categories = businessCategories.map(({ name, slug }) => ({
    name,
    slug,
  }));

  const grid = generateGrid(categories, width > 768 ? [5, 4] : [2, 1], {
    name: "All",
    slug: "all",
  });

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
