import { Business, BusinessType, User } from "@prisma-app/client";
import { LoaderFunction, TypedResponse, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { DataTable } from "~/components/data-table";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { getBusinessByType, getBusinessTypeBySlug } from "~/utils/api.server";
import { copyToClipboard } from "~/utils/helpers.client";

type LoaderData = {
  businessType: BusinessType;
  businesses: Array<Business & { owner: User }>;
};

export const loader: LoaderFunction = async ({
  params,
}): Promise<TypedResponse<LoaderData>> => {
  const type = params.type;
  if (!type) {
    throw json({ message: "Slug not found" }, { status: 400 });
  }

  const businessType = await getBusinessTypeBySlug(type);
  if (!businessType) {
    throw json({ message: "Invalid type of business" }, { status: 404 });
  }

  const businesses = await getBusinessByType(businessType.id);

  return json({ businessType, businesses });
};

export default function Members() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const {
    businessType: { name },
    businesses,
  } = useLoaderData<LoaderData>();

  const table = useReactTable({
    data: businesses,
    columns: [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "owner.name", header: "Owner" },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
          <div
            className="hover:cursor-pointer"
            onClick={() =>
              copyToClipboard(row.getValue("phone"), "Copied to clipboard")
            }
          >
            {row.getValue("phone")}
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <div
            className="hover:cursor-pointer"
            onClick={() =>
              copyToClipboard(row.getValue("email"), "Copied to clipboard")
            }
          >
            {row.getValue("email")}
          </div>
        ),
      },
      {
        accessorKey: "id",
        header: "Details",
        cell: ({ row }) => (
          <Button>
            <Link to={`/business/${row.getValue("id")}`}>View</Link>
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

  return (
    <main className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">{name}</h1>
      <Input
        name="email"
        placeholder="Filter emails..."
        value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("email")?.setFilterValue(event.target.value)
        }
        className="max-w-sm"
      />
      <DataTable table={table} />
    </main>
  );
}
