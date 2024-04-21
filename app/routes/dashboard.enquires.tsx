import { Enquiry } from "@prisma-app/client";
import {
  ActionFunction,
  LoaderFunction,
  TypedResponse,
  json,
  redirect,
} from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { DataTable } from "~/components/data-table";
import { Button } from "~/components/ui/button";
import useActionDataWithToast from "~/hooks/use-action-data-with-toast";
import siteConfig from "~/site.config";
import { ActionResponse } from "~/types";
import {
  getBusinessByOwnerId,
  getEnquiriesByBusinessId,
  toggleMarkEnquiryAsResolved,
} from "~/utils/api.server";
import { copyToClipboard } from "~/utils/helpers.client";
import { requireUserId } from "~/utils/session.server";
import { ResolveEnquirySchema, validate } from "~/utils/validation";

export const meta = () => [
  { title: `${siteConfig.name} | Enquiries` },
  { name: "description", content: siteConfig.description },
];

type LoaderData = {
  enquires: Enquiry[];
};

export const loader: LoaderFunction = async ({
  request,
}): Promise<TypedResponse<LoaderData>> => {
  const userId = await requireUserId(request);
  const business = await getBusinessByOwnerId(userId);

  if (!business) {
    throw redirect("/dashboard/onboarding");
  }

  const enquires = await getEnquiriesByBusinessId(business.id);

  return json({ enquires });
};

export const action: ActionFunction = async ({ request }): ActionResponse => {
  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());
  const parsedRes = validate(body, ResolveEnquirySchema);

  if (parsedRes.success) {
    const enquiry = await toggleMarkEnquiryAsResolved(parsedRes.data.id);
    if (enquiry.isResolved) {
      return json({ message: "Enquiry marked as resolved" });
    } else {
      return json({ message: "Enquiry marked as not resolved" });
    }
  }

  return json({ fieldErrors: parsedRes.errors }, { status: 400 });
};

export default function DashboardEnquires() {
  const submit = useSubmit();
  const { enquires } = useLoaderData<LoaderData>();
  const actionData = useActionDataWithToast();

  const table = useReactTable({
    data: enquires,
    columns: [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (row.getValue("id") as string).slice(0, 8),
      },
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
        header: "Actions",
        cell: ({ row }) => (
          <Button
            type="button"
            onClick={() => markAsResolved(row.getValue("id"))}
          >
            {row.getValue("isResolved")
              ? "Mark as unresolved"
              : "Mark as resolved"}
          </Button>
        ),
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  const markAsResolved = async (id: string) =>
    submit({ id }, { method: "POST" });

  return (
    <main className="flex grow flex-col gap-5">
      <h1 className="text-2xl font-bold">Enquiries</h1>
      <DataTable table={table} />
    </main>
  );
}
