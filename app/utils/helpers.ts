import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/ /g, "_")
    .replace(/[^\w-]+/g, "");

export function generateGrid<T>(
  types: Array<T>,
  rowSize: [number, number] = [5, 4],
  extra?: T
) {
  let grid: T[][] = [];
  let counter = 0;

  if (extra) {
    types.unshift(extra);
  }

  while (types.length > 0) {
    let size = counter % 2 === 0 ? rowSize[0] : rowSize[1];
    grid.push(types.splice(0, size));
    counter++;
  }

  return grid;
}
