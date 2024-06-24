import { BusinessEnquiry, Enquiry } from "@prisma-app/client";
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
import { db } from "~/utils/db.server";
import { copyToClipboard } from "~/utils/helpers.client";
import { requireUserId } from "~/utils/session.server";
import { ActionResponse } from "~/utils/types";
import { ResolveEnquirySchema, validate } from "~/utils/validation";

export const meta = () => [
  { title: `${siteConfig.name} | Enquiries` },
  { name: "description", content: siteConfig.description },
];

type LoaderData = {
  businessEnquiries: BusinessEnquiry[];
  generalEnquiries: Enquiry[];
};

export const loader: LoaderFunction = async ({
  request,
}): Promise<TypedResponse<LoaderData>> => {
  const userId = await requireUserId(request);
  const business = await db.business.findFirst({ where: { ownerId: userId } });

  if (!business) {
    throw redirect("/dashboard/onboarding");
  }

  const businessEnquiries = await db.businessEnquiry.findMany({
    where: { businessId: business.id },
  });
  const generalEnquiries = await db.enquiry.findMany({
    where: { businessType: { id: business.typeId } },
    include: { user: true },
  });

  return json({ businessEnquiries, generalEnquiries });
};

export const action: ActionFunction = async ({ request }): ActionResponse => {
  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());
  const parsedRes = validate(body, ResolveEnquirySchema);

  if (parsedRes.success) {
    const { id } = parsedRes.data;
    const enquiry = await db.businessEnquiry.findUnique({ where: { id } });
    if (!enquiry) {
      throw new Error("Enquiry not found");
    }

    const resolvedEnquiry = await db.businessEnquiry.update({
      where: { id },
      data: { isResolved: !enquiry.isResolved },
    });
    if (resolvedEnquiry.isResolved) {
      return json({ message: "Enquiry marked as resolved" });
    } else {
      return json({ message: "Enquiry marked as not resolved" });
    }
  }

  return json({ fieldErrors: parsedRes.errors }, { status: 400 });
};

export default function DashboardEnquires() {
  const submit = useSubmit();
  const { businessEnquiries, generalEnquiries } = useLoaderData<LoaderData>();
  useActionDataWithToast();

  const businessEnquiriesTable = useReactTable({
    data: businessEnquiries,
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
  const generalEnquiriesTable = useReactTable({
    data: generalEnquiries,
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
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  const markAsResolved = async (id: string) =>
    submit({ id }, { method: "POST" });

  return (
    <main className="flex grow flex-col gap-5">
      <h2 className="text-lg font-bold">Business Enquiries</h2>
      <DataTable table={businessEnquiriesTable} />
      <h2 className="text-lg font-bold">General Enquiries</h2>
      <DataTable table={generalEnquiriesTable} />
    </main>
  );
}
