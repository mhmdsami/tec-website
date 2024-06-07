import { Blog } from "@prisma-app/client";
import { json, LoaderFunction, TypedResponse } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BlogCard } from "~/components/cards";
import { getAllBlogs } from "~/utils/api.server";

type LoaderData = {
  blogs: Blog[];
};

export const loader: LoaderFunction = async (): Promise<
  TypedResponse<LoaderData>
> => {
  const blogs = await getAllBlogs();

  return json({ blogs });
};

export default function Blogs() {
  const { blogs } = useLoaderData<LoaderData>();

  return (
    <main className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {blogs.map((blog, idx) => (
        <BlogCard key={idx} {...blog} />
      ))}
    </main>
  );
}
