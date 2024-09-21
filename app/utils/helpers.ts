import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const slugify = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export function generateGrid<T>(
  types: Array<T>,
  rowSize: [number, number] = [5, 4],
  extra?: T,
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

export const makeNameDisplayable = (name: string) => {
  return name.split(/([&/ ])/).join(" ");
};

export const toTitleCase = (str: string) => {
  return str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase();
};

export function convertToCSV(arr: Array<any>) {
  const array = [Object.keys(arr[0])].concat(arr);

  return array
    .map((values) => {
      return Object.values(values).toString();
    })
    .join("\n");
}
