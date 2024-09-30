import { Business, BusinessClinic } from "@prisma-app/client";
import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import useActionDataWithToast from "~/hooks/use-action-data-with-toast";
import siteConfig from "~/site.config";
import { db } from "~/utils/db.server";
import { LoaderResponse } from "~/utils/types";

export const meta: MetaFunction = () => [
  { title: `${siteConfig.name} | Admin Business Clinic` },
  { name: "description", content: siteConfig.description },
];

type LoaderData = {
  submissions: Array<BusinessClinic & { business: Business }>;
};

export const loader: LoaderFunction = async ({
  request,
}): LoaderResponse<LoaderData> => {
  const submissions = await db.businessClinic.findMany({
    include: {
      business: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return json({ submissions });
};

export default function AdminBusinessClinic() {
  const { submissions } = useLoaderData<LoaderData>();
  useActionDataWithToast();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: submissions,
    columns: [
      {
        accessorKey: "business.name",
        header: "Business",
      },
      {
        id: "email",
        accessorKey: "business.email",
        header: "Email",
      },
      {
        accessorKey: "business.phone",
        header: "Phone",
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => (
          <p>
            {new Date(row.original.createdAt).toLocaleDateString(["en-IN"])}
          </p>
        ),
      },
      {
        accessorKey: "id",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <SubmissionDetails {...row.original} />
            <Button asChild>
              <Link to={`/business/${row.original.business.slug}`}>
                View Business Page
              </Link>
            </Button>
          </div>
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
      <h1 className="text-2xl font-bold">Business Clinic</h1>
      <div className="flex flex-row flex-wrap items-center justify-between gap-2">
        <Input
          name="email"
          placeholder="Filter by email..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="w-full sm:w-[250px]"
        />
      </div>
      <DataTable table={table} />
    </main>
  );
}

interface SubmissionDetailsProps extends Omit<BusinessClinic, "createdAt"> {
  createdAt: string;
}

function SubmissionDetails({
  monthlySales,
  numberOfEmployees,
  haveDepartmentHeads,
  numberOfDepartmentHeads,
  natureOfBusiness,
  segmentations,
  customerClassification,
  challenges,
  burningChallenge,
}: SubmissionDetailsProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>View Details</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogHeader>
            <DialogTitle>Business Clinic</DialogTitle>
          </DialogHeader>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input
            name="monthlySales"
            label="Monthly sales"
            value={monthlySales}
            disabled
          />
          <Input
            name="numberOfEmployees"
            label="Number of Employees"
            value={numberOfEmployees}
            disabled
          />
          <Input
            name="haveDepartmentHeads"
            label="Have Department Heads"
            value={haveDepartmentHeads ? "Yes" : "No"}
            disabled
          />
          {numberOfDepartmentHeads && (
            <Input
              name="numberOfDepartmentHeads"
              label="Number of Department Heads"
              value={numberOfDepartmentHeads}
              disabled
            />
          )}
          <Input
            name="natureOfBusiness"
            label="Nature of Business"
            value={natureOfBusiness}
            disabled
          />
          <Input
            name="segmentations"
            label="Company Segmentation"
            value={segmentations}
            disabled
          />
          <Input
            name="customerClassification"
            label="Customer Classification"
            value={customerClassification}
            disabled
          />
          <Textarea
            name="challenges"
            label="Challenges"
            value={challenges}
            disabled
          />
          <Textarea
            name="burningChallenge"
            label="Challenges"
            value={burningChallenge}
            disabled
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
