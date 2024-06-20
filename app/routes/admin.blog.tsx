import { valibotResolver } from "@hookform/resolvers/valibot";
import { Blog } from "@prisma-app/client";
import {
  ActionFunction,
  LoaderFunction,
  TypedResponse,
  json,
} from "@remix-run/node";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { DataTable } from "~/components/data-table";
import ImageUpload from "~/components/image-upload";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import useActionDataWithToast from "~/hooks/use-action-data-with-toast";
import { ActionResponse } from "~/types";
import { db } from "~/utils/db.server";
import { cn } from "~/utils/helpers";
import { AddBlogSchema, DeleteBlogSchema, validate } from "~/utils/validation";

type LoaderData = {
  blogs: Blog[];
};

export const loader: LoaderFunction = async (): Promise<
  TypedResponse<LoaderData>
> => {
  const blogs = await db.blog.findMany();

  return json({ blogs });
};

export const action: ActionFunction = async ({ request }): ActionResponse => {
  const formData = await request.formData();
  const body = Object.fromEntries(formData);
  const action = formData.get("action");

  switch (action) {
    case "add": {
      const parseRes = validate(body, AddBlogSchema);

      if (!parseRes.success) {
        return json({ fieldErrors: parseRes.errors }, { status: 400 });
      }

      const blog = await db.blog.create({
        data: parseRes.data,
      });
      if (blog) {
        return json({ message: "Blog created successfully" });
      }

      return json({ error: "Failed to create blog" }, { status: 500 });
    }

    case "delete": {
      const parseRes = validate(body, DeleteBlogSchema);
      if (!parseRes.success) {
        return json({ fieldErrors: parseRes.errors }, { status: 400 });
      }

      const { id } = parseRes.data;
      const blog = await db.blog.delete({ where: { id } });
      if (blog) {
        return json({ message: "Blog deleted successfully" });
      }

      return json({ error: "Failed to delete blog" }, { status: 500 });
    }

    default:
      return json({ message: "Invalid action" }, { status: 400 });
  }
};

export default function AdminBlog() {
  const { blogs } = useLoaderData<LoaderData>();
  const submit = useSubmit();
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    formState: { errors },
    control,
    handleSubmit,
    reset,
  } = useForm({
    resolver: valibotResolver(AddBlogSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      image: "",
    },
  });

  const actionData = useActionDataWithToast({
    onMessage: reset,
  });

  const table = useReactTable({
    data: blogs,
    columns: [
      { accessorKey: "title", header: "Title" },
      { accessorKey: "description", header: "Description" },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) =>
          new Date(row.getValue("createdAt")).toLocaleDateString(),
      },
      {
        accessorKey: "id",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => deleteBlog(row.getValue("id"))}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  const deleteBlog = async (id: string) =>
    submit({ action: "delete", id }, { method: "post" });

  return (
    <main className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Manage Blogs</h1>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-fit self-end">Add Blog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Blog</DialogTitle>
            <DialogDescription>Add a new blog</DialogDescription>
          </DialogHeader>
          <Form
            className="flex flex-col gap-3"
            onSubmit={handleSubmit((values) =>
              submit({ action: "add", ...values }, { method: "POST" }),
            )}
          >
            <Input
              name="title"
              label="Title"
              placeholder="title"
              errorMessage={errors.title?.message}
              register={register}
            />
            <Textarea
              name="description"
              label="Description"
              placeholder="description"
              errorMessage={errors.description?.message}
              register={register}
            />
            <Textarea
              name="content"
              label="Content"
              placeholder="Enter blog content..."
              errorMessage={errors.content?.message}
              register={register}
            />
            <div className="flex flex-col gap-2">
              <Label>Image</Label>
              <Controller
                control={control}
                name="image"
                render={({ field }) => (
                  <ImageUpload
                    imageUrl={field.value}
                    onChange={field.onChange}
                    folder="blogs"
                    isUploading={isUploading}
                    setIsUploading={setIsUploading}
                  />
                )}
              />
              <p
                className={cn(
                  "hidden text-sm text-destructive",
                  errors.image && "block",
                )}
              >
                {errors.image?.message}
              </p>
            </div>
            <Button
              type="submit"
              className="w-24 self-end"
              disabled={isUploading}
            >
              Add
            </Button>
          </Form>
        </DialogContent>
      </Dialog>
      <DataTable table={table} />
    </main>
  );
}
