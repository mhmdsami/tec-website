import { BusinessEnquiry } from "@prisma-app/client";
import { json, LoaderFunction, redirect, TypedResponse } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { DataTable } from "~/components/data-table";
import { Badge } from "~/components/ui/badge";
import { getBusinessEnquiriesByUserId, getUserById } from "~/utils/api.server";
import { copyToClipboard } from "~/utils/helpers.client";
import { redirectToBasedOnRole } from "~/utils/helpers.server";
import { requireUserId } from "~/utils/session.server";

type LoaderData = {
  enquiries: BusinessEnquiry[];
};

export const loader: LoaderFunction = async ({
  request,
}): Promise<TypedResponse<LoaderData>> => {
  const userId = await requireUserId(request);

  const user = await getUserById(userId);
  if (!user) return redirect("/sign-in");
  const redirectTo = redirectToBasedOnRole(user, "USER");
  if (redirectTo) return redirect(redirectTo);

  const enquiries = await getBusinessEnquiriesByUserId(userId);

  return json({ enquiries });
};

export default function Me() {
  const { enquiries } = useLoaderData<LoaderData>();

  const table = useReactTable({
    data: enquiries,
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

  return (
    <main className="flex grow flex-col gap-5">
      <h1 className="text-2xl font-bold">Your Enquiries</h1>
      <DataTable table={table} />
    </main>
  );
}
