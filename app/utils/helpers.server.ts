export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/ /g, "_")
    .replace(/[^\w-]+/g, "");
