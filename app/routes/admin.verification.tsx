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
import siteConfig from "~/site.config";
import { db } from "~/utils/db.server";
import { copyToClipboard } from "~/utils/helpers.client";
import { ActionData } from "~/utils/types";
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
  const businesses = await db.business.findMany({ include: { owner: true } });

  return json({ businesses });
};

export const action: ActionFunction = async ({
  request,
}): Promise<TypedResponse<ActionData>> => {
  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());
  const parseRes = validate(body, VerifyBusinessSchema);

  if (parseRes.success) {
    const { id } = parseRes.data;
    try {
      const business = await db.business.findUnique({ where: { id } });
      if (!business) {
        return json({ error: "Business not found" }, { status: 404 });
      }
      const updateBusiness = await db.business.update({
        where: { id },
        data: { isVerified: !business.isVerified },
      });

      if (updateBusiness.isVerified) {
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
  useActionDataWithToast();

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
            variant={row.getValue("isVerified") ? "default" : "destructive"}
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
      <div className="flex flex-row flex-wrap items-center justify-between gap-2">
        <Input
          name="email"
          placeholder="Filter emails..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="w-full sm:w-[250px]"
        />
        <Select onValueChange={handleStatusFilterChange} defaultValue="all">
          <SelectTrigger className="w-full sm:w-[130px]">
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
      <input hidden name="id" value={id} readOnly />
      <Button type="submit" className="w-24">
        {isVerified ? "Unverify" : "Verify"}
      </Button>
    </Form>
  );
};
