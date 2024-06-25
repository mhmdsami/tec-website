import { Contact } from "@prisma-app/client";
import {
  ActionFunction,
  TypedResponse,
  json,
  type LoaderFunction,
} from "@remix-run/node";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { CheckCircle2, XCircle } from "lucide-react";
import { DataTable } from "~/components/data-table";
import { Button } from "~/components/ui/button";
import useActionDataWithToast from "~/hooks/use-action-data-with-toast";
import { db } from "~/utils/db.server";
import { copyToClipboard } from "~/utils/helpers.client";
import { ResolveContactSchema, validate } from "~/utils/validation";

type LoaderData = {
  enquires: Contact[];
};

export const loader: LoaderFunction = async (): Promise<
  TypedResponse<LoaderData>
> => {
  const enquires = await db.contact.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return json({ enquires });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const body = Object.fromEntries(formData);

  const parseRes = validate(body, ResolveContactSchema);
  if (!parseRes.success) {
    return json({ error: "Failed to resolve" }, { status: 400 });
  }

  const { id } = parseRes.data;
  const contact = await db.contact.findUnique({
    where: {
      id,
    },
  });

  if (!contact) {
    return json({ error: "Contact not found" }, { status: 404 });
  }

  await db.contact.update({
    where: {
      id,
    },
    data: {
      isResolved: !contact.isResolved,
    },
  });

  if (contact.isResolved) {
    return json({ message: "Contact marked as unresolved" });
  }

  return json({ message: "Contact marked as resolved" });
};

export default function AdminEnquiry() {
  const { enquires } = useLoaderData<LoaderData>();
  useActionDataWithToast();

  const table = useReactTable({
    data: enquires,
    columns: [
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "Email",
        accessorKey: "email",
        cell: ({ row }) => (
          <div
            className="cursor-pointer"
            onClick={() =>
              copyToClipboard(row.original.email, "Email copied to clipboard")
            }
          >
            {row.original.email}
          </div>
        ),
      },
      {
        header: "Phone",
        accessorKey: "phone",
        cell: ({ row }) => (
          <div
            className="cursor-pointer"
            onClick={() =>
              copyToClipboard(row.original.phone, "Phone copied to clipboard")
            }
          >
            {row.original.phone}
          </div>
        ),
      },
      {
        header: "Status",
        accessorKey: "resolved",
        cell: ({ row }) =>
          row.original.isResolved ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-green-500" /> Not Resolved
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <XCircle className="text-red-400" /> Resolved
            </div>
          ),
      },
      {
        header: "Created At",
        accessorKey: "createdAt",
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString(),
      },
      {
        header: "Actions",
        accessorKey: "actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <MarkAsResolved
              id={row.original.id}
              isResolved={row.original.isResolved}
            />
          </div>
        ),
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <main className="flex flex-col gap-5 px-10 py-5">
      <h1 className="text-2xl font-bold">Admin Enquiry</h1>
      <DataTable table={table} />
    </main>
  );
}

interface MarkAsResolvedProps {
  id: string;
  isResolved: boolean;
}

const MarkAsResolved = ({ id, isResolved }: MarkAsResolvedProps) => {
  const submit = useSubmit();

  return (
    <Form method="POST">
      <input name="id" value={id} hidden readOnly />
      <Button type="submit">
        {isResolved ? "Mark as unresolved" : "Mark as resolved"}
      </Button>
    </Form>
  );
};
