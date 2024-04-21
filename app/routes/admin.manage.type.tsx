import { valibotResolver } from "@hookform/resolvers/valibot";
import { BusinessType } from "@prisma-app/client";
import {
  ActionFunction,
  LoaderFunction,
  TypedResponse,
  json,
} from "@remix-run/node";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
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
import useActionDataWithToast from "~/hooks/use-action-data-with-toast";
import siteConfig from "~/site.config";
import { ActionResponse } from "~/types";
import {
  createBusinessType,
  deleteBusinessType,
  getBusinessByType,
  getBusinessTypeBySlug,
  getBusinessTypes,
} from "~/utils/api.server";
import { slugify } from "~/utils/helpers";
import {
  AddBusinessTypeSchema,
  DeleteBusinessTypeSchema,
  validate,
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

export const action: ActionFunction = async ({ request }): ActionResponse => {
  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());
  const action = formData.get("action");

  switch (action) {
    case "add": {
      const parseRes = validate(body, AddBusinessTypeSchema);

      if (parseRes.success) {
        const doesExist = await getBusinessTypeBySlug(
          slugify(parseRes.data.name),
        );
        if (doesExist) {
          return json(
            { error: "Business Type already exists" },
            { status: 409 },
          );
        }

        const businessType = await createBusinessType(parseRes.data.name);
        if (businessType) {
          return json({
            message: "Business Type added successfully",
          });
        }

        return json({ error: "Failed to add Business Type" }, { status: 500 });
      }

      return json({ fieldErrors: parseRes.errors }, { status: 400 });
    }

    case "delete": {
      const parseRes = validate(body, DeleteBusinessTypeSchema);

      if (parseRes.success) {
        const business = await getBusinessByType(parseRes.data.id);
        if (business) {
          return json({ error: "Business type is in use" }, { status: 409 });
        }

        const res = await deleteBusinessType(parseRes.data.id);
        if (res) {
          return json({ message: "Business Type deleted successfully" });
        }

        return json(
          { error: "Failed to delete Business Type" },
          { status: 500 },
        );
      }

      return json(
        { success: false, fieldErrors: parseRes.errors },
        { status: 400 },
      );
    }

    default:
      return json({ error: "Invalid action" }, { status: 400 });
  }
};

export default function AdminManageType() {
  const submit = useSubmit();
  const { businessTypes } = useLoaderData<LoaderData>();

  const {
    register,
    formState: { errors },
    watch,
    reset,
    handleSubmit,
  } = useForm({
    resolver: valibotResolver(AddBusinessTypeSchema),
    defaultValues: {
      name: "",
    },
  });

  const actionData = useActionDataWithToast({
    onMessage: reset,
  });

  const table = useReactTable({
    data: businessTypes,
    columns: [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "slug", header: "Slug" },
      {
        accessorKey: "id",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            variant="destructive"
            type="button"
            onClick={() => deleteBusinessType(row.getValue("id"))}
          >
            Delete
          </Button>
        ),
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  const deleteBusinessType = (id: string) =>
    submit({ action: "delete", id }, { method: "POST" });

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
          <Form
            className="flex flex-col gap-3"
            onSubmit={handleSubmit((values) =>
              submit({ action: "add", ...values }, { method: "POST" }),
            )}
          >
            <Input
              name="name"
              label="Name"
              placeholder="Type Name"
              errorMessage={errors.name?.message}
              register={register}
            />
            <Input
              label="Slug"
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
