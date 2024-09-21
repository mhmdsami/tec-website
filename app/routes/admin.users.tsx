import { valibotResolver } from "@hookform/resolvers/valibot";
import { User } from "@prisma-app/client";
import {
  ActionFunction,
  LoaderFunction,
  TypedResponse,
  json,
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
import { Badge } from "~/components/ui/badge";
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
import useActionDataWithDisclosure from "~/hooks/use-action-data-with-disclosure";
import useActionDataWithToast from "~/hooks/use-action-data-with-toast";
import siteConfig from "~/site.config";
import { db } from "~/utils/db.server";
import { cn, toTitleCase } from "~/utils/helpers";
import { requireUserId } from "~/utils/session.server";
import { ActionResponse } from "~/utils/types";
import {
  DeleteUserSchema,
  UpdateUserSchema,
  validate,
} from "~/utils/validation";

export const meta = () => [
  { title: `${siteConfig.name} | Admin Manage Users` },
  { name: "description", content: siteConfig.description },
];

type LoaderData = {
  users: User[];
};

export const loader: LoaderFunction = async (): Promise<
  TypedResponse<LoaderData>
> => {
  const users = await db.user.findMany();

  return json({ users });
};

export const action: ActionFunction = async ({ request }): ActionResponse => {
  const formData = await request.formData();
  const action = formData.get("action");
  const body = Object.fromEntries(formData.entries());

  switch (action) {
    case "update": {
      const parseRes = validate(body, UpdateUserSchema);
      if (!parseRes.success) {
        return json({ fieldErrors: parseRes.errors }, 400);
      }

      const { id, ...details } = parseRes.data;
      const user = await db.user.update({
        where: { id },
        data: { ...details, isAdmin: details.type === "ADMIN" },
      });

      if (!user) {
        return json({ error: "Failed to update user" }, 500);
      }

      return json({ message: "Updated user successfully" });
    }
    case "delete": {
      const parseRes = validate(body, DeleteUserSchema);
      if (!parseRes.success) {
        return json({ fieldErrors: parseRes.errors }, 400);
      }

      const userId = await requireUserId(request);
      if (parseRes.data.id === userId) {
        return json({ error: "You cannot delete yourself" });
      }

      const user = await db.user.delete({ where: { id: parseRes.data.id } });

      if (!user) {
        return json({ error: "Failed to delete user" }, 500);
      }

      return json({ message: "Deleted user successfully" });
    }
    default: {
      return json({ error: "Invalid action" }, 400);
    }
  }
};

export default function AdminEvents() {
  useActionDataWithToast();

  const { users } = useLoaderData<LoaderData>();

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: users,
    columns: [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => <Badge>{toTitleCase(row.original.type)}</Badge>,
      },
      {
        accessorKey: "id",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <UpdateUser {...row.original} />
            <DeleteUser {...row.original} />
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

  const handleTypeChange = (value: string) => {
    if (value === "admin") table.getColumn("type")?.setFilterValue("ADMIN");
    if (value === "business")
      table.getColumn("type")?.setFilterValue("BUSINESS");
    if (value === "user") table.getColumn("type")?.setFilterValue("USER");
    if (value === "all") table.getColumn("type")?.setFilterValue(undefined);
  };

  return (
    <main className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Manage Users</h1>
      <div className="flex flex-row flex-wrap items-center justify-between gap-2">
        <Input
          name="email"
          placeholder="Filter emails..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="w-full sm:w-[250px]"
        />
        <Select onValueChange={handleTypeChange} defaultValue="all">
          <SelectTrigger className="w-full sm:w-[130px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable table={table} />
    </main>
  );
}

interface DeleteUserProps extends Omit<User, "createdAt"> {}

function DeleteUser({ id, name, email }: DeleteUserProps) {
  const submit = useSubmit();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete user</DialogTitle>
          <DialogDescription className="text-destructive">
            This action is irreversible
          </DialogDescription>
        </DialogHeader>
        <p>
          Delete <span className="font-bold">{name}</span> (
          <span className="font-bold">{email}</span>) permanently.
        </p>
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => submit({ action: "delete", id }, { method: "POST" })}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface UpdateUserProps extends Omit<User, "createdAt"> {}

function UpdateUser({ id, name, email, type }: UpdateUserProps) {
  const submit = useSubmit();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      id,
      name,
      email,
      type,
    },
    resolver: valibotResolver(UpdateUserSchema),
  });
  const { isOpen, setIsOpen } = useActionDataWithDisclosure();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Button>Update</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update user</DialogTitle>
        </DialogHeader>
        <Form
          className="flex flex-col gap-3"
          onSubmit={handleSubmit((values) =>
            submit({ action: "update", ...values }, { method: "POST" }),
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
            errorMessage={errors.email?.message}
            register={register}
          />
          <div className="flex flex-col gap-2">
            <Label>Type</Label>
            <Controller
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="BUSINESS">Business</SelectItem>
                    <SelectItem value="USER">User</SelectItem>
                  </SelectContent>
                </Select>
              )}
              name="type"
              control={control}
            />
            <p
              className={cn(
                "hidden text-sm text-destructive",
                errors.type && "block",
              )}
            >
              {errors.type?.message}
            </p>
          </div>
          <Button type="submit" className="w-fit self-end">
            Update
          </Button>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
