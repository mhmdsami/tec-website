import { Business, User } from "@prisma-app/client";
import {
  ActionFunction,
  LoaderFunction,
  TypedResponse,
  json,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { DataTable } from "~/components/data-table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import siteConfig from "~/site.config";
import {
  getAllBusinesses,
  toggleBusinessVerification,
} from "~/utils/api.server";
import { copyToClipboard } from "~/utils/helpers.client";
import { validateVerifyBusiness } from "~/utils/validation";

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

type ActionData =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      fieldErrors: Record<string, string>;
    };

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());
  const parseRes = validateVerifyBusiness(body);

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
      return json(
        { success: false, message: "Failed to verify business" },
        { status: 500 },
      );
    }
  }

  return json(
    { success: false, fieldErrors: parseRes.errors },
    { status: 400 },
  );
};

export default function AdminVerification() {
  const { businesses } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.message);
    }
  }, [actionData]);

  return (
    <main className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Admin Verification</h1>
      <DataTable
        columns={[
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
        ]}
        data={businesses}
      />
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
