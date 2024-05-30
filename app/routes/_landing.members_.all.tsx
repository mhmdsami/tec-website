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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { getAllVerifiedBusinesses, getBusinessTypes } from "~/utils/api.server";
import { copyToClipboard } from "~/utils/helpers.client";

type LoaderData = {
  businessTypes: BusinessType[];
  businesses: Array<Business & { owner: User }>;
};

export const loader: LoaderFunction = async ({
  params,
}): Promise<TypedResponse<LoaderData>> => {
  const businessTypes = await getBusinessTypes();
  const businesses = await getAllVerifiedBusinesses();

  return json({ businessTypes, businesses });
};

export default function MembersAll() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const { businessTypes, businesses } = useLoaderData<LoaderData>();

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
        accessorKey: "typeId",
        header: "Type",
        cell: ({ row }) =>
          businessTypes.find((bt) => bt.id === row.getValue("typeId"))?.name ??
          "N/A",
      },
      {
        accessorKey: "id",
        header: "Details",
        cell: ({ row }) => (
          <Button>
            <Link to={`/business/${row.getValue("id")}`} prefetch="intent">
              View
            </Link>
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

  const handleTypeFilterChange = (value: string) => {
    if (value === "all") {
      table.getColumn("typeId")?.setFilterValue(undefined);
    } else {
      table.getColumn("typeId")?.setFilterValue(value);
    }
  };

  return (
    <main className="flex flex-col gap-5">
      <div className="flex flex-row flex-wrap items-center justify-between gap-2">
        <div className="flex w-full flex-row flex-wrap items-center gap-2 sm:w-fit">
          <Input
            name="name"
            placeholder="Search by name"
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="w-full sm:w-[250px]"
          />
          <Input
            name="email"
            placeholder="Search by email"
            value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("email")?.setFilterValue(event.target.value)
            }
            className="w-full sm:w-[200px]"
          />
        </div>
        <Select onValueChange={handleTypeFilterChange} defaultValue="all">
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {businessTypes.map(({ id, name }) => (
              <SelectItem value={id}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataTable table={table} />
    </main>
  );
}
