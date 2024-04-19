import { valibotResolver } from "@hookform/resolvers/valibot";
import { BusinessType } from "@prisma-app/client";
import {
  ActionFunction,
  LoaderFunction,
  TypedResponse,
  json,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { DataTable } from "~/components/data-table";
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
import { cn } from "~/lib/utils";
import siteConfig from "~/site.config";
import {
  createBusinessType,
  getBusinessTypeBySlug,
  getBusinessTypes,
} from "~/utils/api.server";
import { slugify } from "~/utils/helpers";
import {
  AddBusinessTypeSchema,
  validateAddBusinessType,
} from "~/utils/validation";

export const meta = () => [
  { title: `${siteConfig.name} | Admin Add Business Type` },
  { name: "description", content: siteConfig.description },
];

type LoaderData = {
  businessTypes: BusinessType[];
};

export const loader: LoaderFunction = async (): Promise<
  TypedResponse<LoaderData>
> => {
  const businessTypes = await getBusinessTypes();

  return json({ businessTypes });
};

type ActionData = {
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());
  const parseRes = validateAddBusinessType(body);

  if (parseRes.success) {
    const doesExist = await getBusinessTypeBySlug(slugify(parseRes.data.name));
    if (doesExist) {
      return json({ error: "Business Type already exists" }, { status: 409 });
    }

    const businessType = await createBusinessType(parseRes.data.name);
    if (businessType) {
      return json({
        success: true,
        message: "Business Type added successfully",
      });
    }

    return json(
      { success: false, message: "Failed to add Business Type" },
      { status: 500 },
    );
  }

  return json(
    { success: false, fieldErrors: parseRes.errors },
    { status: 400 },
  );
};

export default function AdminManageType() {
  const { businessTypes } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const {
    register,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: valibotResolver(AddBusinessTypeSchema),
    defaultValues: {
      name: "",
    },
  });
  const table = useReactTable({
    data: businessTypes,
    columns: [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "slug", header: "Slug" },
    ],
    getCoreRowModel: getCoreRowModel(),
  });
  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    }

    if (actionData?.message) {
      reset();
      toast.success(actionData.message);
    }
  }, [actionData]);

  return (
    <main className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Manage Business Type</h1>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-fit self-end">Add Business Type</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Business Type</DialogTitle>
            <DialogDescription>Add new business type</DialogDescription>
          </DialogHeader>
          <Form className="flex flex-col gap-3" method="POST">
            <Label>Name</Label>
            <Input placeholder="Type Name" {...register("name")} />
            <p
              className={cn(
                "hidden text-sm text-destructive",
                errors.name && "block",
              )}
            >
              {errors.name?.message}
            </p>
            <Label>Slug</Label>
            <Input
              placeholder="Slug"
              name="slug"
              type="text"
              required
              value={slugify(watch("name"))}
              readOnly
            />
            <Button type="submit" className="w-24 self-end">
              Add
            </Button>
          </Form>
        </DialogContent>
      </Dialog>
      <DataTable table={table} />
    </main>
  );
}
