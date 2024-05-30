import { valibotResolver } from "@hookform/resolvers/valibot";
import { BusinessType } from "@prisma-app/client";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
  TypedResponse,
} from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useOutletContext,
  useSubmit,
} from "@remix-run/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import ImageUpload from "~/components/image-upload";
import { Button } from "~/components/ui/button";
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
import { DashboardOutletContext } from "~/routes/dashboard";
import { ActionResponse } from "~/types";
import { getBusinessTypes, updateBusiness } from "~/utils/api.server";
import { cn } from "~/utils/helpers";
import { requireUserId } from "~/utils/session.server";
import { BusinessSchema, validate } from "~/utils/validation";

type LoaderData = {
  businessTypes: BusinessType[];
};

export const loader: LoaderFunction = async (): Promise<
  TypedResponse<LoaderData>
> => {
  const businessTypes = await getBusinessTypes();

  return json({ businessTypes });
};

export const action: ActionFunction = async ({ request }): ActionResponse => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());

  const parseRes = validate(body, BusinessSchema);
  if (parseRes.success) {
    await updateBusiness(userId, parseRes.data);
    return redirect("/dashboard");
  }

  return json({ fieldErrors: parseRes.errors }, { status: 400 });
};

export default function DashboardEdit() {
  const submit = useSubmit();
  const [isUploading, setIsUploading] = useState(false);
  const { business } = useOutletContext<DashboardOutletContext>();
  const { businessTypes } = useLoaderData<LoaderData>();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
    watch,
  } = useForm({
    resolver: valibotResolver(BusinessSchema),
    defaultValues: {
      name: business?.name,
      typeId: business?.typeId,
      tagline: business?.tagline,
      about: business?.about,
      logo: business?.logo,
      coverImage: business?.coverImage,
      location: business?.location,
      instagram: business?.instagram,
      whatsApp: business?.whatsApp,
      email: business?.email,
      phone: business?.phone,
    },
  });

  return (
    <Form
      className="mx-auto flex max-w-[800px] grow flex-col justify-center gap-3"
      onSubmit={handleSubmit((data) => submit(data, { method: "post" }))}
    >
      <div className="grid grid-cols-2 content-center gap-3">
        <Input name="name" label="Name" register={register} />
        <div className="flex flex-col gap-2">
          <Label>Business Type</Label>
          <Controller
            render={({ field }) => (
              <Select onValueChange={field.onChange} {...field}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map(({ id, name }) => (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            name="typeId"
            control={control}
          />
          <p
            className={cn(
              "hidden text-sm text-destructive",
              errors.typeId && "block",
            )}
          >
            {errors.typeId?.message}
          </p>
        </div>
        <Input
          name="tagline"
          label="Tagline"
          errorMessage={errors.tagline?.message}
          register={register}
        />
        <Textarea
          className="row-span-2 h-[160px]"
          name="about"
          label="About"
          errorMessage={errors.tagline?.message}
          register={register}
        />
        <div className="row-span-2 flex flex-col gap-2">
          <Label>Logo</Label>
          <Controller
            control={control}
            name="logo"
            render={({ field }) => (
              <ImageUpload
                imageUrl={watch("logo")}
                onChange={field.onChange}
                folder="logo"
                isUploading={isUploading}
                setIsUploading={setIsUploading}
              />
            )}
          />
          <p
            className={cn(
              "hidden text-sm text-destructive",
              errors.logo && "block",
            )}
          >
            {errors.logo?.message}
          </p>
        </div>
        <div className="row-span-2 flex flex-col gap-2">
          <Label>Cover Image</Label>
          <Controller
            control={control}
            name="coverImage"
            render={({ field }) => (
              <ImageUpload
                imageUrl={watch("coverImage")}
                onChange={field.onChange}
                folder="coverImage"
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
        <Input
          name="location"
          label="Location"
          errorMessage={errors.location?.message}
          register={register}
        />
        <Input
          name="instagram"
          label="Instagram"
          errorMessage={errors.instagram?.message}
          register={register}
        />
        <Input
          name="whatsApp"
          label="WhatsApp"
          errorMessage={errors.whatsApp?.message}
          register={register}
        />
        <Input
          name="email"
          label="Email"
          errorMessage={errors.email?.message}
          register={register}
        />
        <Input
          name="phone"
          label="Phone"
          errorMessage={errors.phone?.message}
          register={register}
        />
      </div>
      <Button
        type="submit"
        className="w-fit self-end"
        disabled={!isDirty || isUploading}
      >
        Save
      </Button>
    </Form>
  );
}
