import { Blog } from "@prisma-app/client";
import { json, LoaderFunction, TypedResponse } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Calendar } from "lucide-react";
import { getBlogById } from "~/utils/api.server";

type LoaderData = {
  blog: Blog;
};

export const loader: LoaderFunction = async ({
  params,
}): Promise<TypedResponse<LoaderData>> => {
  const id = params.id;

  if (!id) {
    throw new Error("Blog id not found");
  }

  const blog = await getBlogById(id);

  if (!blog) {
    throw new Error("Blog not found");
  }

  return json({ blog });
};

export default function BlogPage() {
  const {
    blog: { title, description, content, image, createdAt },
  } = useLoaderData<LoaderData>();

  return (
    <main className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{title}</h1>
        <h2 className="flex items-center gap-1 text-muted-foreground">
          <Calendar size={16} />{" "}
          {new Date(createdAt).toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </h2>
      </div>
      <div className="mx-auto max-w-prose object-contain">
        <img src={image} alt={title} className="rounded-md" />
      </div>
      <p className="mx-auto max-w-prose object-contain">{content}</p>
    </main>
  );
}
