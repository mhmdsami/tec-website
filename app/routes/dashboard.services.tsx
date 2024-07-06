import { valibotResolver } from "@hookform/resolvers/valibot";
import { Service } from "@prisma-app/client";
import { ActionFunction, json } from "@remix-run/node";
import { Form, useOutletContext, useSubmit } from "@remix-run/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import ImageUpload from "~/components/image-upload";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
import useActionDataWithDisclosure from "~/hooks/use-action-data-with-disclosure";
import useActionDataWithToast from "~/hooks/use-action-data-with-toast";
import { DashboardOutletContext } from "~/routes/dashboard";
import siteConfig from "~/site.config";
import { db } from "~/utils/db.server";
import { cn } from "~/utils/helpers";
import { requireUserId } from "~/utils/session.server";
import { ActionResponse } from "~/utils/types";
import {
  AddServiceSchema,
  DeleteServiceSchema,
  EditServiceSchema,
  validate,
} from "~/utils/validation";

export const meta = () => [
  { title: `${siteConfig.name} | Services` },
  { name: "description", content: siteConfig.description },
];

export const action: ActionFunction = async ({
  request,
}): Promise<ActionResponse> => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());
  const action = formData.get("action");

  const business = await db.business.findFirst({ where: { ownerId: userId } });
  if (!business) {
    return json({ error: "Business not found" }, { status: 400 });
  }

  switch (action) {
    case "add": {
      const parseRes = validate(body, AddServiceSchema);

      if (parseRes.success) {
        await db.business.update({
          where: { id: business.id },
          data: {
            services: {
              push: parseRes.data,
            },
          },
        });
        return json({ message: "Service added" });
      }

      return json({ fieldErrors: parseRes.errors }, { status: 400 });
    }
    case "edit": {
      const parseRes = validate(body, EditServiceSchema);

      if (parseRes.success) {
        const { id, ...data } = parseRes.data;
        await db.business.update({
          where: { id: business.id },
          data: {
            services: {
              set: business.services.map((s) =>
                s.id === id ? { ...s, ...data } : s,
              ),
            },
          },
        });
        return json({ message: "Service updated" });
      }

      return json({ fieldErrors: parseRes.errors }, { status: 400 });
    }
    case "delete": {
      const parseRes = validate(body, DeleteServiceSchema);

      if (parseRes.success) {
        await db.business.update({
          where: { id: business.id },
          data: {
            services: {
              set: business.services.filter((s) => s.id !== parseRes.data.id),
            },
          },
        });
        return json({ message: "Service deleted" });
      }

      return json({ fieldErrors: parseRes.errors }, { status: 400 });
    }
    default:
      return json({ message: "Invalid action" }, { status: 400 });
  }
};

export default function DashboardServices() {
  const submit = useSubmit();
  const {
    business: { slug, services },
  } = useOutletContext<DashboardOutletContext>();
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
    control,
    watch,
  } = useForm({
    resolver: valibotResolver(AddServiceSchema),
    defaultValues: {
      title: "",
      description: "",
      image: "",
    },
  });

  useActionDataWithToast({
    onMessage: () => {
      reset();
      setIsOpen(false);
    },
  });

  return (
    <main className="flex grow flex-col gap-5">
      <h1 className="text-2xl font-bold">Services</h1>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="w-fit self-end">Add Service</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Service</DialogTitle>
            <DialogDescription>Add new service</DialogDescription>
          </DialogHeader>
          <Form
            className="flex flex-col gap-3"
            onSubmit={handleSubmit((values) =>
              submit({ action: "add", ...values }, { method: "POST" }),
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
              name="description"
              label="Description"
              placeholder="Description"
              register={register}
              errorMessage={errors.description?.message}
            />
            <div className="flex flex-col gap-2">
              <Label>Image</Label>
              <Controller
                control={control}
                name="image"
                render={({ field }) => (
                  <ImageUpload
                    imageUrl={watch("image")}
                    onChange={field.onChange}
                    folder={`services/${slug}`}
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
            <Button type="submit" className="w-24 self-end">
              Add
            </Button>
          </Form>
        </DialogContent>
      </Dialog>
      {services.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service, idx) => (
            <ServiceCard key={idx} {...service} />
          ))}
        </div>
      ) : (
        <p className="flex grow items-center justify-center">
          No services added
        </p>
      )}
    </main>
  );
}

interface ServiceCardProps extends Service {}

function ServiceCard({ id, title, description, image }: ServiceCardProps) {
  const submit = useSubmit();
  const { isOpen, setIsOpen } = useActionDataWithDisclosure();
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    formState: { errors, isDirty },
    handleSubmit,
    control,
    watch,
  } = useForm({
    resolver: valibotResolver(AddServiceSchema),
    defaultValues: {
      title: title,
      description: description,
      image: image || "",
    },
  });

  const deleteService = (id: string) =>
    submit({ action: "delete", id }, { method: "POST" });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-end gap-2">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-fit self-end">Edit</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit</DialogTitle>
              <DialogDescription>Edit service</DialogDescription>
            </DialogHeader>
            <Form
              className="flex flex-col gap-3"
              onSubmit={handleSubmit((values) =>
                submit({ action: "edit", id, ...values }, { method: "POST" }),
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
                name="description"
                label="Description"
                placeholder="Description"
                register={register}
                errorMessage={errors.description?.message}
              />
              <div className="flex flex-col gap-2">
                <Label>Image</Label>
                <Controller
                  control={control}
                  name="image"
                  render={({ field }) => (
                    <ImageUpload
                      imageUrl={watch("image")}
                      onChange={field.onChange}
                      folder="service"
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
              <Button
                type="submit"
                className="w-24 self-end"
                disabled={!isDirty || isUploading}
              >
                Save
              </Button>
            </Form>
          </DialogContent>
        </Dialog>
        <Button variant="destructive" onClick={() => deleteService(id)}>
          Delete
        </Button>
      </CardContent>
    </Card>
  );
}
