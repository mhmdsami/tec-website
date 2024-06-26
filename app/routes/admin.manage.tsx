import { valibotResolver } from "@hookform/resolvers/valibot";
import { BusinessCategory, BusinessType } from "@prisma-app/client";
import {
  ActionFunction,
  LoaderFunction,
  TypedResponse,
  json,
} from "@remix-run/node";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import useActionDataWithDisclosure from "~/hooks/use-action-data-with-disclosure";
import useActionDataWithToast from "~/hooks/use-action-data-with-toast";
import siteConfig from "~/site.config";
import { db } from "~/utils/db.server";
import { cn, slugify } from "~/utils/helpers";
import { ActionResponse } from "~/utils/types";
import {
  AddBusinessCategorySchema,
  AddBusinessTypeSchema,
  DeleteBusinessTypeSchema,
  validate,
} from "~/utils/validation";

export const meta = () => [
  { title: `${siteConfig.name} | Admin Add Business Type` },
  { name: "description", content: siteConfig.description },
];

type LoaderData = {
  businessCategories: Array<BusinessCategory & { types: BusinessType[] }>;
};

export const loader: LoaderFunction = async (): Promise<
  TypedResponse<LoaderData>
> => {
  const businessCategories = await db.businessCategory.findMany({
    include: { types: true },
  });

  return json({ businessCategories });
};

export const action: ActionFunction = async ({ request }): ActionResponse => {
  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());
  const action = formData.get("action");

  switch (action) {
    case "addCategory": {
      const parseRes = validate(body, AddBusinessCategorySchema);

      if (parseRes.success) {
        const { name } = parseRes.data;
        const doesExist = await db.businessCategory.findUnique({
          where: { slug: slugify(name) },
        });
        if (doesExist) {
          return json(
            { error: "Business Category already exists" },
            { status: 409 },
          );
        }

        const businessType = await db.businessCategory.create({
          data: { name, slug: slugify(name) },
        });
        if (businessType) {
          return json({
            message: "Business Category added successfully",
          });
        }

        return json(
          { error: "Failed to add Business Category" },
          { status: 500 },
        );
      }

      return json({ fieldErrors: parseRes.errors }, { status: 400 });
    }

    case "deleteCategory": {
      const parseRes = validate(body, DeleteBusinessTypeSchema);

      if (!parseRes.success) {
        return json({ fieldErrors: parseRes.errors }, { status: 400 });
      }

      const { id } = parseRes.data;
      const res = await db.businessCategory.delete({ where: { id } });

      if (res) {
        return json({ message: "Business Category deleted successfully" });
      }

      return json(
        { error: "Failed to delete Business Category" },
        { status: 500 },
      );
    }

    case "add": {
      const parseRes = validate(body, AddBusinessTypeSchema);

      if (parseRes.success) {
        const { name, categoryId: businessCategoryId } = parseRes.data;
        const doesExist = await db.businessType.findUnique({
          where: { slug: slugify(name) },
        });
        if (doesExist) {
          return json(
            { error: "Business Type already exists" },
            { status: 409 },
          );
        }

        const businessType = await db.businessType.create({
          data: {
            name,
            slug: slugify(name),
            businessCategoryId,
          },
        });
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
        const { id } = parseRes.data;
        const business = await db.business.count({ where: { typeId: id } });
        if (business) {
          return json({ error: "Business type is in use" }, { status: 409 });
        }

        const res = await db.businessType.delete({ where: { id } });
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

export default function AdminManage() {
  useActionDataWithToast();

  return (
    <main className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Manage Category/Type</h1>
      <div className="flex flex-wrap gap-2 self-end">
        <AddBusinessCategory />
        <AddBusinessType />
      </div>
      <ManageBusinessCategory />
      <ManageBusinessType />
    </main>
  );
}

function ManageBusinessCategory() {
  const { businessCategories } = useLoaderData<LoaderData>();
  const table = useReactTable({
    data: businessCategories,
    columns: [
      { accessorKey: "name", header: "Name" },
      {
        accessorKey: "id",
        header: "Actions",
        cell: ({ row }) => <DeleteBusinessCategory id={row.original.id} />,
      },
    ],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold">Business Category</h1>
      <DataTable table={table} />
    </div>
  );
}

function ManageBusinessType() {
  const { businessCategories } = useLoaderData<LoaderData>();
  const businessTypes = businessCategories.flatMap((category) =>
    category.types.map((type) => ({
      ...type,
      category: category.name,
      categorySlug: category.slug,
    })),
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data: businessTypes,
    columns: [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "category", header: "Category" },
      {
        accessorKey: "id",
        header: "Actions",
        cell: ({ row }) => <DeleteBusinessType id={row.original.id} />,
      },
    ],
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  });

  const handleCategoryFilterChange = (value: string) => {
    if (value === "all") {
      table.getColumn("category")?.setFilterValue(undefined);
    } else {
      table.getColumn("category")?.setFilterValue(value);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold">Business Type</h1>
      <Select onValueChange={handleCategoryFilterChange} defaultValue="all">
        <SelectTrigger className="w-full sm:w-[250px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {businessCategories.map(({ slug, name }) => (
            <SelectItem key={slug} value={slug}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <DataTable table={table} />
    </div>
  );
}

function AddBusinessCategory() {
  const submit = useSubmit();

  const {
    register,
    formState: { errors },
    watch,
    reset,
    handleSubmit,
  } = useForm({
    resolver: valibotResolver(AddBusinessCategorySchema),
    defaultValues: {
      name: "",
    },
  });

  const { actionData, isOpen, setIsOpen } = useActionDataWithDisclosure();

  useEffect(() => {
    if (actionData?.message) {
      reset();
    }
  }, [actionData]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full self-end sm:w-fit">
          Add Business Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Business Category</DialogTitle>
          <DialogDescription>Add new business category</DialogDescription>
        </DialogHeader>
        <Form
          className="flex flex-col gap-3"
          onSubmit={handleSubmit((values) =>
            submit({ action: "addCategory", ...values }, { method: "POST" }),
          )}
        >
          <Input
            name="name"
            label="Category Name"
            placeholder="Category Name"
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
  );
}

function AddBusinessType() {
  const { businessCategories } = useLoaderData<LoaderData>();
  const submit = useSubmit();
  const {
    register,
    formState: { errors },
    watch,
    reset,
    handleSubmit,
    control,
  } = useForm({
    resolver: valibotResolver(AddBusinessTypeSchema),
    defaultValues: {
      name: "",
      categoryId: "",
    },
  });

  const { actionData, isOpen, setIsOpen } = useActionDataWithDisclosure();

  useEffect(() => {
    if (actionData?.message) {
      reset();
    }
  }, [actionData]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full self-end sm:w-fit">Add Business Type</Button>
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
          <div className="flex flex-col gap-2">
            <Label>Business Category</Label>
            <Controller
              render={({ field }) => (
                <Select onValueChange={field.onChange} {...field}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessCategories.map(({ id, name }) => (
                      <SelectItem key={id} value={id}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              name="categoryId"
              control={control}
            />
            <p
              className={cn(
                "hidden text-sm text-destructive",
                errors.categoryId && "block",
              )}
            >
              {errors.categoryId?.message}
            </p>
          </div>
          <Input
            name="name"
            label="Category"
            placeholder="Category Name"
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
  );
}

function DeleteBusinessType({ id }: { id: string }) {
  const submit = useSubmit();

  return (
    <Button
      variant="destructive"
      type="button"
      onClick={() => submit({ action: "delete", id }, { method: "POST" })}
    >
      Delete
    </Button>
  );
}

function DeleteBusinessCategory({ id }: { id: string }) {
  const submit = useSubmit();

  return (
    <Button
      variant="destructive"
      type="button"
      onClick={() => submit({ action: "deleteCategory", id }, { method: "POST" })}
    >
      Delete
    </Button>
  );
}