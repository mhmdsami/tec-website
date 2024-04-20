import { Business, User } from "@prisma-app/client";
import {
  ActionFunction,
  LoaderFunction,
  TypedResponse,
  json,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { DataTable } from "~/components/data-table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import useActionDataWithToast from "~/hooks/use-action-data-with-toast";
import { cn } from "~/lib/utils";
import siteConfig from "~/site.config";
import { ActionData } from "~/types";
import {
  getAllBusinesses,
  toggleBusinessVerification,
} from "~/utils/api.server";
import { copyToClipboard } from "~/utils/helpers.client";
import { VerifyBusinessSchema, validate } from "~/utils/validation";

export const meta = () => [
  { title: `${siteConfig.name} | Admin Verification` },
  { name: "description", content: siteConfig.description },
];

type LoaderData = {
  businesses: Array<Business & { owner: User }>;
};

export const loader: LoaderFunction = async (): Promise<
  TypedResponse<LoaderData>
> => {
  const businesses = await getAllBusinesses();

  return json({ businesses });
};

export const action: ActionFunction = async ({
  request,
}): Promise<TypedResponse<ActionData>> => {
  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());
  const parseRes = validate(body, VerifyBusinessSchema);

  if (parseRes.success) {
    try {
      const business = await toggleBusinessVerification(parseRes.data.id);
      if (business.isVerified) {
        return json(
          { success: true, message: "Business verified successfully" },
          { status: 200 },
        );
      } else {
        return json(
          { success: true, message: "Business unverified successfully" },
          { status: 200 },
        );
      }
    } catch (error) {
      return json({ error: "Failed to verify business" }, { status: 500 });
    }
  }

  return json(
    { success: false, fieldErrors: parseRes.errors },
    { status: 400 },
  );
};

export default function AdminVerification() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const { businesses } = useLoaderData<LoaderData>();
  const actionData = useActionDataWithToast();

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
        accessorKey: "isVerified",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            className={cn(
              row.getValue("isVerified") ? "bg-primary" : "bg-destructive",
            )}
          >
            {row.getValue("isVerified") ? "Verified" : "Not Verified"}
          </Badge>
        ),
      },
      {
        accessorKey: "id",
        header: "Actions",
        cell: ({ row }) => (
          <VerifyButton
            id={row.getValue("id")}
            isVerified={row.getValue("isVerified")}
          />
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

  const handleStatusFilterChange = (value: string) => {
    if (value === "true") {
      table.getColumn("isVerified")?.setFilterValue(true);
    } else if (value === "false") {
      table.getColumn("isVerified")?.setFilterValue(false);
    } else {
      table.getColumn("isVerified")?.setFilterValue(undefined);
    }
  };

  return (
    <main className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Admin Verification</h1>
      <div className="flex flex-row items-center justify-between">
        <Input
          placeholder="Filter emails..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Select onValueChange={handleStatusFilterChange} defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Verified</SelectItem>
            <SelectItem value="false">Unverified</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable table={table} />
    </main>
  );
}

const VerifyButton = ({
  isVerified,
  id,
}: {
  isVerified: boolean;
  id: number;
}) => {
  return (
    <Form method="POST">
      <input hidden name="id" value={id} />
      <Button type="submit" className="w-24">
        {isVerified ? "Unverify" : "Verify"}
      </Button>
    </Form>
  );
};
