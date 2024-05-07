import { valibotResolver } from "@hookform/resolvers/valibot";
import { Event } from "@prisma-app/client";
import {
  ActionFunction,
  LoaderFunction,
  TypedResponse,
  json,
} from "@remix-run/node";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { DataTable } from "~/components/data-table";
import { DatePicker } from "~/components/date-picker";
import ImageUpload from "~/components/image-upload";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
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
import { Textarea } from "~/components/ui/textarea";
import useActionDataWithToast from "~/hooks/use-action-data-with-toast";
import { cn } from "~/lib/utils";
import siteConfig from "~/site.config";
import { createEvent, getAllEvents } from "~/utils/api.server";
import { AddEventSchema, validate } from "~/utils/validation";

export const meta = () => [
  { title: `${siteConfig.name} | Admin Events` },
  { name: "description", content: siteConfig.description },
];

type LoaderData = {
  events: Event[];
};

export const loader: LoaderFunction = async (): Promise<
  TypedResponse<LoaderData>
> => {
  const events = await getAllEvents();

  return json({ events });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());
  const action = formData.get("action");

  switch (action) {
    case "add":
      const parseRes = validate(
        {
          ...body,
          date: new Date(body.date as string),
        },
        AddEventSchema,
      );
      if (!parseRes.success) {
        return json({ errors: parseRes.errors }, { status: 400 });
      }

      const event = await createEvent(parseRes.data);
      if (event) {
        return json({ message: "Event added successfully" });
      }

      return json({ message: "Failed to add event" }, { status: 500 });

    default:
      return json({ message: "Invalid action" }, { status: 400 });
  }
};

export default function AdminEvents() {
  const { events } = useLoaderData<LoaderData>();
  const submit = useSubmit();
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm({
    resolver: valibotResolver(AddEventSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date(),
      coverImage: "",
    },
  });

  const actionData = useActionDataWithToast({
    onMessage: reset,
  });

  const table = useReactTable({
    data: events,
    columns: [
      { accessorKey: "title", header: "Title" },
      { accessorKey: "description", header: "Description" },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => new Date(row.getValue("date")).toLocaleDateString(),
      },
      {
        accessorKey: "id",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <ManageEvent {...row.original} />
          </div>
        ),
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <main className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Manage Events</h1>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-fit self-end">Add Event</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event</DialogTitle>
            <DialogDescription>Add a new event</DialogDescription>
          </DialogHeader>
          <Form
            className="flex flex-col gap-3"
            onSubmit={handleSubmit((values) =>
              submit(
                {
                  action: "add",
                  ...values,
                  date: values.date.toISOString(),
                },
                { method: "POST" },
              ),
            )}
          >
            <Input
              name="title"
              label="Title"
              placeholder="Title"
              errorMessage={errors.title?.message}
              register={register}
            />
            <Textarea
              name="description"
              label="Description"
              placeholder="Event description"
              errorMessage={errors.description?.message}
              register={register}
            />
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
              <Label>Cover Image</Label>
              <Controller
                control={control}
                name="coverImage"
                render={({ field }) => (
                  <ImageUpload
                    imageUrl={field.value}
                    onChange={field.onChange}
                    folder="events"
                    isUploading={isUploading}
                    setIsUploading={setIsUploading}
                  />
                )}
              />
              <p
                className={cn(
                  "hidden text-sm text-destructive",
                  errors.coverImage && "block",
                )}
              >
                {errors.coverImage?.message}
              </p>
            </div>
            <Button type="submit" className="w-24 self-end">
              Add
            </Button>
          </Form>
        </DialogContent>
      </Dialog>
      <DataTable table={table} />
    </main>
  );
}

interface ManageEventProps extends Omit<Event, "date" | "createdAt"> {
  date: string;
  createdAt: string;
}

function ManageEvent({
  title,
  description,
  date,
  coverImage,
}: ManageEventProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Manage</Button>
      </DrawerTrigger>
      <DrawerContent className="h-2/3 px-10">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-5">
            <div className="text-2xl">{title}</div>
          </DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
