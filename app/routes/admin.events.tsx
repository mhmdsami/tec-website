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
import siteConfig from "~/site.config";
import {
  addEventImage,
  createEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
} from "~/utils/api.server";
import { cn } from "~/utils/helpers";
import {
  AddEventImageSchema,
  AddEventSchema,
  DeleteEventSchema,
  validate,
} from "~/utils/validation";

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
    case "add": {
      const parseRes = validate(
        {
          ...body,
          date: new Date(body.date as string),
        },
        AddEventSchema,
      );
      if (!parseRes.success) {
        return json({ fieldErrors: parseRes.errors }, { status: 400 });
      }

      const event = await createEvent(parseRes.data);
      if (event) {
        return json({ message: "Event added successfully" });
      }

      return json({ message: "Failed to add event" }, { status: 500 });
    }

    case "delete": {
      const parseRes = validate(body, DeleteEventSchema);
      if (!parseRes.success) {
        return json({ fieldErrors: parseRes.errors }, { status: 400 });
      }

      const event = await deleteEvent(parseRes.data.id);
      if (event) {
        return json({ message: "Event deleted successfully" });
      }

      return json({ message: "Failed to delete event" }, { status: 500 });
    }

    case "addImage": {
      const parseRes = validate(body, AddEventImageSchema);

      if (!parseRes.success) {
        return json({ fieldErrors: parseRes.errors }, { status: 400 });
      }

      const event = await getEventById(parseRes.data.id);
      if (!event) {
        return json({ error: "Event not found" }, { status: 404 });
      }

      const { id, image, description = "" } = parseRes.data;
      const updatedEvent = await addEventImage(id, image, description);

      if (updatedEvent) {
        return json({ message: "Image added successfully" });
      }

      return json({ message: "Failed to add image" }, { status: 500 });
    }

    default:
      return json({ message: "Invalid action" }, { status: 400 });
  }
};

export default function AdminEvents() {
  const { events } = useLoaderData<LoaderData>();
  const submit = useSubmit();

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
            <Button
              variant="destructive"
              onClick={() => deleteEvent(row.getValue("id"))}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  const deleteEvent = (id: string) =>
    submit({ action: "delete", id }, { method: "POST" });

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
  id,
  title,
  description,
  date,
  images,
}: ManageEventProps) {
  const submit = useSubmit();
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: valibotResolver(AddEventImageSchema),
    defaultValues: {
      id,
      image: "",
      description: "",
    },
  });

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
        <div className="flex flex-col gap-5 overflow-scroll px-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-fit self-end">Add Image</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Event image</DialogTitle>
                <DialogDescription>Add event image</DialogDescription>
              </DialogHeader>
              <Form
                className="flex flex-col gap-3"
                onSubmit={handleSubmit((values) =>
                  submit(
                    { action: "addImage", ...values },
                    {
                      method: "POST",
                    },
                  ),
                )}
              >
                <div className="flex flex-col gap-2">
                  <Label>Image</Label>
                  <Controller
                    control={control}
                    name="image"
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
                      errors.image && "block",
                    )}
                  >
                    {errors.image?.message}
                  </p>
                </div>
                <Input
                  name="description"
                  label="Description"
                  placeholder="Image description"
                  errorMessage={errors.description?.message}
                  register={register}
                />
                <Button
                  type="submit"
                  className="w-24 self-end"
                  disabled={isUploading}
                >
                  Add
                </Button>
              </Form>
            </DialogContent>
          </Dialog>
          <h1 className="text-xl font-bold">Current Images</h1>
          <div className="grid h-1/2 grid-cols-6 gap-5">
            {images.map(({ url, description }, idx) => (
              <img
                key={idx}
                className="w-[200px]"
                src={url}
                alt={description || ""}
              />
            ))}
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
