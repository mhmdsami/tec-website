import { Business, User } from "@prisma-app/client";
import { LoaderFunction, TypedResponse, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Copy } from "lucide-react";
import { useState } from "react";
import { DataTable } from "~/components/data-table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import siteConfig from "~/site.config";
import { getAllVerifiedBusinesses } from "~/utils/api.server";
import { cn } from "~/utils/helpers";
import { copyToClipboard } from "~/utils/helpers.client";

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
  const businesses = await getAllVerifiedBusinesses();

  return json({ businesses });
};

export default function AdminBusinesses() {
  const { businesses } = useLoaderData<LoaderData>();

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
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
          <VerificationBadge isVerified={row.getValue("isVerified")} />
        ),
      },
      {
        accessorKey: "id",
        header: "Actions",
        cell: ({ row: { original } }) => <BusinessDetails {...original} />,
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
      <h1 className="text-2xl font-bold">Verified Businesses</h1>
      <div className="flex gap-3">
        <Input
          name="name"
          placeholder="Filter name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Input
          name="email"
          placeholder="Filter emails..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <DataTable table={table} />
    </main>
  );
}

interface BusinessDetailsProps extends Omit<Business, "createdAt"> {
  createdAt: string;
  owner: Omit<User, "createdAt"> & { createdAt: string };
}

function BusinessDetails({
  name,
  tagline,
  isVerified,
  phone,
  about,
  instagram,
  whatsApp,
  location,
  email,
  owner: { name: ownerName, email: ownerEmail },
}: BusinessDetailsProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Details</Button>
      </DrawerTrigger>
      <DrawerContent className="h-2/3 px-10">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-5">
            <div className="text-2xl">{name}</div>
            <VerificationBadge isVerified={isVerified} />
          </DrawerTitle>
          <DrawerDescription>{tagline}</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-5 px-4">
          <h1 className="text-xl font-bold">Business Information</h1>
          <div className="grid grid-cols-3 gap-5">
            <CopiableInput label="Name" value={name} />
            <CopiableInput label="Email" value={email} />
            <CopiableInput label="Tagline" value={tagline} />
            <CopiableInput label="Phone" value={phone} />
            <CopiableInput label="About" value={about} />
            <CopiableInput label="Instagram" value={instagram} />
            <CopiableInput label="WhatsApp" value={whatsApp} />
            <CopiableInput label="Location" value={location} />
          </div>
          <h1 className="text-xl font-bold">Owner Information</h1>
          <div className="grid grid-cols-3 gap-5">
            <CopiableInput label="Owner Name" value={ownerName} />
            <CopiableInput label="Owner Email" value={ownerEmail} />
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function VerificationBadge({ isVerified }: { isVerified: boolean }) {
  return (
    <Badge className={cn(isVerified ? "bg-primary" : "bg-destructive")}>
      {isVerified ? "Verified" : "Not Verified"}
    </Badge>
  );
}

function CopiableInput({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div
        className="flex h-10 w-full justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:cursor-pointer"
        onClick={() =>
          copyToClipboard(value, `Copied ${label.toLowerCase()} to clipboard`)
        }
      >
        {value}
        <Copy size={20} />
      </div>
    </div>
  );
}
