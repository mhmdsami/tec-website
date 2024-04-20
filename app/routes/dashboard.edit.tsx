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
import { Controller, useForm } from "react-hook-form";
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
import { cn } from "~/lib/utils";
import { DashboardOutletContext } from "~/routes/dashboard";
import { getBusinessTypes, updateBusiness } from "~/utils/api.server";
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

export const action: ActionFunction = async ({ request }) => {
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
  const { business } = useOutletContext<DashboardOutletContext>();
  const { businessTypes } = useLoaderData<LoaderData>();
  const submit = useSubmit();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
  } = useForm({
    resolver: valibotResolver(BusinessSchema),
    defaultValues: {
      name: business?.name,
      typeId: business?.typeId,
      tagline: business?.tagline,
      about: business?.about,
      location: business?.location,
      instagram: business?.instagram,
      whatsApp: business?.whatsApp,
      email: business?.email,
      phone: business?.phone,
    },
  });

  return (
    <Form
      className="mx-auto flex h-screen max-w-[800px] flex-col justify-center gap-3"
      onSubmit={handleSubmit((data) => submit(data, { method: "post" }))}
    >
      <div className="grid grid-cols-2 content-center gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input {...register("name")} />
          <p
            className={cn(
              "hidden text-sm text-destructive",
              errors.name && "block",
            )}
          >
            {errors.name?.message}
          </p>
        </div>
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
        <div className="flex flex-col gap-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input {...register("tagline")} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="about">About</Label>
          <Textarea {...register("about")} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Location</Label>
          <Input placeholder="Location" {...register("location")} />
          <p
            className={cn(
              "hidden text-sm text-destructive",
              errors.location && "block",
            )}
          >
            {errors.location?.message}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Instagram</Label>
          <Input placeholder="Instagram" {...register("instagram")} />
          <p
            className={cn(
              "hidden text-sm text-destructive",
              errors.instagram && "block",
            )}
          >
            {errors.instagram?.message}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label>WhatsApp Number</Label>
          <Input placeholder="WhatsApp" {...register("whatsApp")} />
          <p
            className={cn(
              "hidden text-sm text-destructive",
              errors.whatsApp && "block",
            )}
          >
            {errors.whatsApp?.message}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Email</Label>
          <Input placeholder="Email" {...register("email")} />
          <p
            className={cn(
              "hidden text-sm text-destructive",
              errors.email && "block",
            )}
          >
            {errors.email?.message}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Phone</Label>
          <Input placeholder="Phone" {...register("phone")} />
          <p
            className={cn(
              "hidden text-sm text-destructive",
              errors.phone && "block",
            )}
          >
            {errors.phone?.message}
          </p>
        </div>
      </div>
      <Button type="submit" className="w-fit self-end" disabled={!isDirty}>
        Save
      </Button>
    </Form>
  );
}
