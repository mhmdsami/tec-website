import { valibotResolver } from "@hookform/resolvers/valibot";
import { ActionFunction, json } from "@remix-run/node";
import { Form, useOutletContext, useSubmit } from "@remix-run/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import useActionDataWithToast from "~/hooks/use-action-data-with-toast";
import { DashboardOutletContext } from "~/routes/dashboard";
import siteConfig from "~/site.config";
import { db } from "~/utils/db.server";
import { cn } from "~/utils/helpers";
import { requireUserId } from "~/utils/session.server";
import { AddImageSchema, validate } from "~/utils/validation";

export const meta = () => [
  { title: `${siteConfig.name} | Gallery` },
  { name: "description", content: siteConfig.description },
];

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const business = await db.business.findFirst({ where: { ownerId: userId } });
  if (!business) {
    return json({ error: "Business not found" }, { status: 400 });
  }

  const body = Object.fromEntries(formData.entries());
  const parseRes = validate(body, AddImageSchema);

  if (!parseRes.success) {
    return json({ fieldErrors: parseRes.errors }, { status: 400 });
  }

  await db.business.update({
    where: { id: business.id },
    data: {
      gallery: {
        push: parseRes.data,
      },
    },
  });

  return json({ message: "Image added" });
};

export default function DashboardGallery() {
  const submit = useSubmit();
  const {
    business: { slug, gallery },
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
    resolver: valibotResolver(AddImageSchema),
    defaultValues: {
      url: "",
      description: "",
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
      <h1 className="text-2xl font-bold">Gallery</h1>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="w-fit self-end">Add Image</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gallery Image</DialogTitle>
            <DialogDescription>Add new image</DialogDescription>
          </DialogHeader>
          <Form
            className="flex flex-col gap-3"
            onSubmit={handleSubmit((values) =>
              submit(values, { method: "POST" }),
            )}
          >
            <div className="flex flex-col gap-2">
              <Label>Image</Label>
              <Controller
                control={control}
                name="url"
                render={({ field }) => (
                  <ImageUpload
                    imageUrl={watch("url")}
                    onChange={field.onChange}
                    folder={`gallery/${slug}`}
                    isUploading={isUploading}
                    setIsUploading={setIsUploading}
                  />
                )}
              />
              <p
                className={cn(
                  "hidden text-sm text-destructive",
                  errors.url && "block",
                )}
              >
                {errors.url?.message}
              </p>
            </div>
            <Input
              name="description"
              label="Description"
              placeholder="Description"
              register={register}
              errorMessage={errors.description?.message}
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
      {gallery.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {gallery.map(({ url, description }) => (
            <img
              src={url}
              alt={description || "gallery image"}
              className="aspect-video rounded-lg object-cover"
            />
          ))}
        </div>
      ) : (
        <p className="flex grow items-center justify-center">No images found</p>
      )}
    </main>
  );
}
