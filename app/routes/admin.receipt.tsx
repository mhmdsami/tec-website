import { valibotResolver } from "@hookform/resolvers/valibot";
import { Receipt } from "@prisma-app/client";
import {
  ActionFunction,
  json,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { DataTable } from "~/components/data-table";
import { DatePicker } from "~/components/date-picker";
import DownloadReceipt from "~/components/receipt";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import useActionDataWithToast from "~/hooks/use-action-data-with-toast";
import siteConfig from "~/site.config";
import { db } from "~/utils/db.server";
import { cn } from "~/utils/helpers";
import { ActionResponse, LoaderResponse } from "~/utils/types";
import { ReceiptSchema, validate } from "~/utils/validation";

export const meta: MetaFunction = () => [
  { title: `${siteConfig.name} | Admin Receipt` },
  { name: "description", content: siteConfig.description },
];

type LoaderData = {
  receipts: Receipt[];
};

export const loader: LoaderFunction = async ({
  request,
}): LoaderResponse<LoaderData> => {
  const receipts = await db.receipt.findMany({
    orderBy: { createdAt: "desc" },
  });

  return json({ receipts });
};

export const action: ActionFunction = async ({ request }): ActionResponse => {
  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());

  const parseRes = validate(
    {
      ...body,
      date: new Date(body.date as string),
    },
    ReceiptSchema,
  );

  if (!parseRes.success) {
    return json({ fieldErrors: parseRes.errors }, { status: 400 });
  }

  const lastReceipt = await db.receipt.findFirst();
  const receiptNumber =
    parseInt(lastReceipt?.receiptNumber.slice(3) || "0") + 1;
  const receipt = await db.receipt.create({
    data: {
      ...parseRes.data,
      receiptNumber: `TEC${receiptNumber.toString().padStart(6, "0")}`,
    },
  });

  if (!receipt) {
    return json({ message: "Failed to create receipt" }, { status: 500 });
  }

  return json({ message: "Receipt created successfully" });
};

export default function AdminReceipt() {
  const { receipts } = useLoaderData<LoaderData>();
  const submit = useSubmit();
  const [isOpen, setIsOpen] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      wing: "",
      name: "",
      phone: "",
      date: new Date(),
      address: "",
      amount: "",
    },
    resolver: valibotResolver(ReceiptSchema),
  });

  useActionDataWithToast({
    onMessage: () => {
      reset();
      setIsOpen(false);
    },
  });

  const table = useReactTable({
    data: receipts,
    columns: [
      {
        accessorKey: "receiptNumber",
        header: "Receipt Number",
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "phone",
        header: "Phone",
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) =>
          new Date(row.getValue("date")).toLocaleDateString(["en-IN"]),
      },
      {
        accessorKey: "wing",
        header: "Wing",
      },
      {
        accessorKey: "amount",
        header: "Amount",
      },
      {
        accessorKey: "id",
        header: "Actions",
        cell: ({ row }) => <DownloadReceipt {...row.original} />,
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
      <h1 className="text-2xl font-bold">Manage Receipts</h1>
      <div className="flex flex-row flex-wrap items-center justify-between gap-2">
        <Input
          name="email"
          placeholder="Filter by receipt number..."
          value={
            (table.getColumn("receiptNumber")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("receiptNumber")?.setFilterValue(event.target.value)
          }
          className="w-full sm:w-[250px]"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button className="w-full sm:w-fit" asChild>
            <a href={`/api/download/receipts`} download="receipts">
              Download Summary
            </a>
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-fit">Create Receipt</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Receipt</DialogTitle>
                <DialogDescription>Create a new receipt</DialogDescription>
              </DialogHeader>
              <Form
                className="flex flex-col gap-3"
                onSubmit={handleSubmit((values) =>
                  submit(
                    { ...values, date: values.date.toISOString() },
                    { method: "POST" },
                  ),
                )}
              >
                <div className="flex flex-col gap-2">
                  <Label>Date</Label>
                  <Controller
                    control={control}
                    name="date"
                    render={({ field }) => (
                      <DatePicker
                        date={field.value}
                        onSelect={field.onChange}
                        className="w-full"
                      />
                    )}
                  />
                  <p
                    className={cn(
                      "hidden text-sm text-destructive",
                      errors.date && "block",
                    )}
                  >
                    {errors.date?.message}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Wing</Label>
                  <Controller
                    render={({ field: { onChange, value } }) => (
                      <Select onValueChange={onChange} value={value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select wing" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Business">
                            Business Wing
                          </SelectItem>
                          <SelectItem value="Social">Social Wing</SelectItem>
                          <SelectItem value="Education">
                            Education Wing
                          </SelectItem>
                          <SelectItem value="Spiritual">
                            Spiritual Wing
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    name="wing"
                    control={control}
                  />
                  <p
                    className={cn(
                      "hidden text-sm text-destructive",
                      errors.wing && "block",
                    )}
                  >
                    {errors.wing?.message}
                  </p>
                </div>
                <Input
                  name="name"
                  label="Name"
                  placeholder="Name"
                  errorMessage={errors.name?.message}
                  register={register}
                />
                <Input
                  name="phone"
                  label="Phone"
                  placeholder="Phone"
                  errorMessage={errors.phone?.message}
                  register={register}
                />
                <Textarea
                  name="address"
                  label="Address"
                  placeholder="Address"
                  errorMessage={errors.address?.message}
                  register={register}
                />
                <Input
                  name="amount"
                  label="Amount"
                  placeholder="Amount"
                  errorMessage={errors.amount?.message}
                  register={register}
                />
                <Button type="submit" className="w-24 self-end">
                  Create
                </Button>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <DataTable table={table} />
    </main>
  );
}
