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
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Textarea } from "~/components/ui/textarea";
import useActionDataWithToast from "~/hooks/use-action-data-with-toast";
import siteConfig from "~/site.config";
import { db } from "~/utils/db.server";
import { cn, slugify } from "~/utils/helpers";
import { ActionResponse } from "~/utils/types";
import {
  AddEventImageSchema,
  AddEventSchema,
  DeleteEventSchema,
  ToggleEventCompletionSchema,
  UpdateEventSchema,
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
  const events = await db.event.findMany();

  return json({ events });
};

export const action: ActionFunction = async ({ request }): ActionResponse => {
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

      const { title, ...details } = parseRes.data;

      const event = await db.event.create({
        data: {
          title,
          slug: slugify(title),
          ...details,
        },
      });
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

      const { id } = parseRes.data;
      const event = await db.event.delete({ where: { id } });
      if (event) {
        return json({ message: "Event deleted successfully" });
      }

      return json({ error: "Failed to delete event" }, { status: 500 });
    }

    case "update": {
      const parseRes = validate(
        {
          ...body,
          date: new Date(body.date as string),
        },
        UpdateEventSchema,
      );

      if (!parseRes.success) {
        return json({ fieldErrors: parseRes.errors }, { status: 400 });
      }

      const { id, ...data } = parseRes.data;
      const event = await db.event.findUnique({ where: { id } });
      if (!event) {
        return json({ error: "Event not found" }, { status: 404 });
      }

      const updatedEvent = await db.event.update({
        where: { id },
        data,
      });

      if (updatedEvent) {
        return json({ message: "Event updated successfully" });
      }

      return json({ message: "Failed to update event" }, { status: 500 });
    }

    case "addImage": {
      const parseRes = validate(body, AddEventImageSchema);

      if (!parseRes.success) {
        return json({ fieldErrors: parseRes.errors }, { status: 400 });
      }

      const { id, image, description = "" } = parseRes.data;
      const event = await db.event.findUnique({ where: { id } });
      if (!event) {
        return json({ error: "Event not found" }, { status: 404 });
      }

      const updatedEvent = await db.event.update({
        where: { id },
        data: {
          images: {
            push: { url: image, description },
          },
        },
      });

      if (updatedEvent) {
        return json({ message: "Image added successfully" });
      }

      return json({ message: "Failed to add image" }, { status: 500 });
    }

    case "toggleCompleted": {
      const parseRes = validate(body, ToggleEventCompletionSchema);

      if (!parseRes.success) {
        return json({ fieldErrors: parseRes.errors }, { status: 400 });
      }

      const { id } = parseRes.data;
      const event = await db.event.findUnique({ where: { id } });
      if (!event) {
        return json({ error: "Event not found" }, { status: 404 });
      }

      const updatedEvent = await db.event.update({
        where: { id },
        data: { isCompleted: !event.isCompleted },
      });
      if (updatedEvent) {
        return json({
          message: "Event completion status updated successfully",
        });
      }

      return json({ error: "Failed to update event" });
    }

    default:
      return json({ error: "Invalid action" }, { status: 400 });
  }
};

export default function AdminEvents() {
  const { events } = useLoaderData<LoaderData>();
  const submit = useSubmit();
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
    reset,
    watch,
  } = useForm({
    resolver: valibotResolver(AddEventSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date(),
    },
  });

  useActionDataWithToast({
    onMessage: () => {
      reset();
      setIsOpen(false);
    },
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
            <Button asChild>
              <a
                href={`/api/download/registrations/${row.original.id}`}
                download={`${slugify(row.original.title)}-registrations`}
              >
                Registrations
              </a>
            </Button>
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
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="w-full self-end sm:w-fit">Add Event</Button>
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
            <Input
              label="Slug"
              name="slug"
              type="text"
              required
              value={slugify(watch("title"))}
              readOnly
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
  images,
  isCompleted,
  date,
}: ManageEventProps) {
  const submit = useSubmit();
  const {
    register,
    control,
    formState: { errors, isDirty },
    handleSubmit,
    watch,
  } = useForm({
    resolver: valibotResolver(UpdateEventSchema),
    defaultValues: {
      id,
      title,
      description,
      date: new Date(date),
    },
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Manage</Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col gap-5 overflow-scroll">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-5">
            Manage Event: {title}
          </SheetTitle>
          <SheetDescription>Update event information</SheetDescription>
          <div className="flex gap-2">
            <Button
              type="submit"
              onClick={() =>
                submit({ action: "toggleCompleted", id }, { method: "POST" })
              }
            >
              Mark as {isCompleted ? "not completed" : "completed"}
            </Button>
            <AddImage id={id} />
          </div>
        </SheetHeader>
        {images.length > 0 && (
          <Carousel>
            <CarouselContent>
              {images.map(({ url, description }, idx) => (
                <CarouselItem key={idx}>
                  <img
                    src={url}
                    alt={description || ""}
                    className="aspect-video object-contain"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="mt-5 flex items-center justify-center gap-3">
              <CarouselPrevious className="static translate-y-0" />
              <CarouselNext className="static translate-y-0" />
            </div>
          </Carousel>
        )}
        <Form
          className="flex flex-col gap-3"
          onSubmit={handleSubmit((values) =>
            submit(
              {
                action: "update",
                ...values,
                date: values.date.toISOString(),
              },
              { method: "POST" },
            ),
          )}
        >
          <input name="id" value={id} hidden />
          <Input
            name="title"
            label="Title"
            placeholder="Title"
            errorMessage={errors.title?.message}
            register={register}
          />
          <Input
            label="Slug"
            name="slug"
            type="text"
            required
            value={slugify(watch("title"))}
            readOnly
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
          <Button type="submit" className="w-24 self-end" disabled={!isDirty}>
            Update
          </Button>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

function AddImage({ id }: { id: string }) {
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
  );
}
