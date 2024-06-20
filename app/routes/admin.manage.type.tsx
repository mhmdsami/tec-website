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
import { ActionResponse } from "~/types";
import { db } from "~/utils/db.server";
import { cn, slugify } from "~/utils/helpers";
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
    case "add-category": {
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

export default function AdminManageType() {
  const submit = useSubmit();
  const { businessCategories } = useLoaderData<LoaderData>();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  useActionDataWithToast({
    onMessage: () => {},
  });

  const businessTypes = businessCategories.flatMap((category) =>
    category.types.map((type) => ({
      ...type,
      category: category.name,
      categorySlug: category.slug,
    })),
  );

  const table = useReactTable({
    data: businessTypes,
    columns: [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "category", header: "Category" },
      {
        accessorKey: "slug",
        header: "Slug",
        cell: ({ row }) => `${row.original.categorySlug}/${row.original.slug}`,
      },
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

  const deleteBusinessType = (id: string) =>
    submit({ action: "delete", id }, { method: "POST" });

  return (
    <main className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Manage Business Type</h1>
      <div className="flex items-center justify-between">
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
        <div className="flex gap-2">
          <AddBusinessCategory />
          <AddBusinessType businessCategories={businessCategories} />
        </div>
      </div>
      <DataTable table={table} />
    </main>
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
        <Button className="w-fit self-end">Add Business Category</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Business Category</DialogTitle>
          <DialogDescription>Add new business category</DialogDescription>
        </DialogHeader>
        <Form
          className="flex flex-col gap-3"
          onSubmit={handleSubmit((values) =>
            submit({ action: "add-category", ...values }, { method: "POST" }),
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

function AddBusinessType({
  businessCategories,
}: {
  businessCategories: BusinessCategory[];
}) {
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
