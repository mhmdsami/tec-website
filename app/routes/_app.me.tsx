import { BusinessEnquiry, Enquiry } from "@prisma-app/client";
import { LoaderFunction, TypedResponse, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { DataTable } from "~/components/data-table";
import { Badge } from "~/components/ui/badge";
import { db } from "~/utils/db.server";
import { copyToClipboard } from "~/utils/helpers.client";
import { redirectToBasedOnRole } from "~/utils/helpers.server";
import { requireUserId } from "~/utils/session.server";

type LoaderData = {
  businessEnquiries: BusinessEnquiry[];
  generalEnquiries: Enquiry[];
};

export const loader: LoaderFunction = async ({
  request,
}): Promise<TypedResponse<LoaderData>> => {
  const userId = await requireUserId(request);

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return redirect("/sign-in");
  const redirectTo = redirectToBasedOnRole(user, "USER");
  if (redirectTo) return redirect(redirectTo);

  const businessEnquiries = await db.businessEnquiry.findMany({
    where: { userId },
    include: { business: true },
  });
  const generalEnquiries = await db.enquiry.findMany({ where: { userId } });

  return json({ businessEnquiries, generalEnquiries });
};

export default function Me() {
  const { businessEnquiries, generalEnquiries } = useLoaderData<LoaderData>();

  const businessEnquiriesTable = useReactTable({
    data: businessEnquiries,
    columns: [
      { accessorKey: "name", header: "Name" },
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
      { accessorKey: "message", header: "Message" },
      {
        accessorKey: "isResolved",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={row.getValue("isResolved") ? "default" : "destructive"}
          >
            {row.getValue("isResolved") ? "Resolved" : "Not Resolved"}
          </Badge>
        ),
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  const generalEnquiriesTable = useReactTable({
    data: generalEnquiries,
    columns: [
      { accessorKey: "name", header: "Name" },
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
      { accessorKey: "message", header: "Message" },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <main className="flex grow flex-col gap-5">
      <h1 className="text-2xl font-bold">Your Enquiries</h1>
      <h2 className="text-lg font-bold">Business Enquiries</h2>
      <DataTable table={businessEnquiriesTable} />
      <h2 className="text-lg font-bold">General Enquiries</h2>
      <DataTable table={generalEnquiriesTable} />
    </main>
  );
}
