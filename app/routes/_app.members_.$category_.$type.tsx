import { valibotResolver } from "@hookform/resolvers/valibot";
import { Business, BusinessType, User } from "@prisma-app/client";
import {
  ActionFunction,
  LoaderFunction,
  TypedResponse,
  json,
} from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useOutletContext,
  useSubmit,
} from "@remix-run/react";
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { AppOutletContext } from "~/routes/_app";
import { ActionResponse } from "~/types";
import {
  getBusinessByType,
  getBusinessCategoryWithTypeBySlug,
  makeGeneralEnquiry,
} from "~/utils/api.server";
import { errorHandler } from "~/utils/error.server";
import { copyToClipboard } from "~/utils/helpers.client";
import { requireUserId } from "~/utils/session.server";
import { EnquirySchema, validate } from "~/utils/validation";

type LoaderData = {
  businessType: BusinessType;
  businesses: Array<Business & { owner: User }>;
};

export const loader: LoaderFunction = async ({
  params,
}): Promise<TypedResponse<LoaderData>> => {
  const category = params.category;
  if (!category) {
    throw json({ message: "Category not found" }, { status: 400 });
  }

  const type = params.type;
  if (!type) {
    throw json({ message: "Type not found" }, { status: 400 });
  }

  const businessCategory = await getBusinessCategoryWithTypeBySlug(category);
  if (!businessCategory) {
    throw json({ message: "Invalid business category" }, { status: 404 });
  }

  const businessType = businessCategory.types.find((t) => t.slug === type);
  if (!businessType) {
    throw json({ message: "Invalid type of business" }, { status: 404 });
  }

  const businesses = await getBusinessByType(businessType.id);

  return json({ businessType, businesses });
};

export const action: ActionFunction = async ({
  request,
  params,
}): ActionResponse => {
  const category = params.category;
  if (!category) {
    throw json({ message: "Category not found" }, { status: 400 });
  }

  const type = params.type;
  if (!type) {
    throw json({ message: "Type not found" }, { status: 400 });
  }

  const userId = await requireUserId(request, `/members/${category}/${type}`);

  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());
  const parseRes = validate(body, EnquirySchema);

  if (parseRes.success) {
    try {
      await makeGeneralEnquiry(parseRes.data, userId, type);
      return json({ message: "Enquiry sent" });
    } catch (error) {
      const { status, message } = errorHandler(error as Error);
      return json({ error: message }, { status });
    }
  }

  return json({ fieldErrors: parseRes.errors }, { status: 400 });
};

export default function Members() {
  const { isLoggedIn } = useOutletContext<AppOutletContext>();
  const submit = useSubmit();
  const [isOpen, setIsOpen] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const {
    businessType: { name },
    businesses,
  } = useLoaderData<LoaderData>();

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm({
    resolver: valibotResolver(EnquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  useActionDataWithToast({
    onMessage: () => {
      setIsOpen(false);
      reset();
    },
  });

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
        accessorKey: "id",
        header: "Details",
        cell: ({ row }) => (
          <Button>
            <Link to={`/business/${row.getValue("id")}`} prefetch="intent">
              View
            </Link>
          </Button>
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
      <h1 className="text-2xl font-bold">{name}</h1>
      <div className="flex items-center justify-between">
        <Input
          name="email"
          placeholder="Filter emails..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        {isLoggedIn ? (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>Enquire</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enquire</DialogTitle>
              </DialogHeader>
              <Form
                className="flex flex-col gap-3"
                onSubmit={handleSubmit((values) =>
                  submit(values, { method: "POST" }),
                )}
              >
                <Input
                  name="name"
                  label="Name"
                  errorMessage={errors.name?.message}
                  register={register}
                />
                <Input
                  name="email"
                  label="Email"
                  type="email"
                  errorMessage={errors.email?.message}
                  register={register}
                />
                <Input
                  name="phone"
                  label="Phone"
                  type="tel"
                  errorMessage={errors.phone?.message}
                  register={register}
                />
                <Textarea
                  name="message"
                  label="Message"
                  errorMessage={errors.message?.message}
                  register={register}
                />
                <Button type="submit" className="w-fit self-end">
                  Submit
                </Button>
              </Form>
            </DialogContent>
          </Dialog>
        ) : (
          <Form method="POST">
            <Button type="submit" className="w-full">
              Sign in to enquire
            </Button>
          </Form>
        )}
      </div>
      <DataTable table={table} />
    </main>
  );
}
