import { valibotResolver } from "@hookform/resolvers/valibot";
import { Business, BusinessType } from "@prisma-app/client";
import {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
  TypedResponse,
  json,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import ImageUpload from "~/components/image-upload";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Progress } from "~/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import siteConfig from "~/site.config";
import { ActionResponse } from "~/types";
import {
  createBusiness,
  getBusinessByOwnerId,
  getBusinessTypes,
  getUserById,
} from "~/utils/api.server";
import { cn } from "~/utils/helpers";
import { requireUserId } from "~/utils/session.server";
import { BusinessSchema, Output, validate } from "~/utils/validation";

export const meta: MetaFunction = () => {
  return [
    { title: `${siteConfig.name} | Business Onboarding` },
    {
      name: "description",
      content: siteConfig.description,
    },
  ];
};

type LoaderData = {
  business: Business | null;
  businessTypes: BusinessType[];
};

export const loader: LoaderFunction = async ({
  request,
}): Promise<TypedResponse<LoaderData>> => {
  const userId = await requireUserId(request);
  const businessTypes = await getBusinessTypes();

  const user = await getUserById(userId);
  if (!user) return redirect("/sign-in");
  if (user.isAdmin) return redirect("/dashboard");

  const business = await getBusinessByOwnerId(user.id);

  return json({ user, business, businessTypes });
};

export const action: ActionFunction = async ({ request }): ActionResponse => {
  const userId = await requireUserId(request);

  const user = await getUserById(userId);
  if (!user) return redirect("/sign-in");

  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());

  const parseRes = validate(body, BusinessSchema);
  if (parseRes.success) {
    const { typeId, ...business } = parseRes.data;
    await createBusiness(business, typeId, user.id);
    return redirect("/dashboard");
  }

  return json({ fieldErrors: parseRes.errors }, { status: 400 });
};

export default function OnboardingForm() {
  const submit = useSubmit();
  const [screen, setScreen] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { business, businessTypes } = useLoaderData<LoaderData>();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
    watch,
  } = useForm({
    resolver: valibotResolver(BusinessSchema),
    defaultValues: {
      name: "",
      typeId: "",
      tagline: "",
      about: "",
      location: "",
      instagram: "",
      whatsApp: "",
      email: "",
      phone: "",
      ...business,
    },
  });

  const fieldsToValidate: Array<Array<keyof Output<typeof BusinessSchema>>> = [
    ["name", "typeId"],
    ["tagline", "about", "logo"],
    ["location", "instagram", "whatsApp"],
    ["email", "phone"],
  ];

  return (
    <div className="flex w-full flex-col gap-5 p-10">
      <h1 className="text-2xl font-bold">Business Onboarding</h1>
      <Form
        className="mx-auto flex h-[70vh] w-full max-w-[400px] flex-col justify-center gap-3"
        onSubmit={handleSubmit((data) => submit(data, { method: "post" }))}
      >
        {screen === 0 && (
          <>
            <Input
              name="name"
              label="Business Name"
              errorMessage={errors.name?.message}
              register={register}
            />
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
          </>
        )}
        {screen === 1 && (
          <>
            <Input
              name="tagline"
              label="Tagline"
              errorMessage={errors.tagline?.message}
              register={register}
            />
            <Textarea
              name="about"
              label="About Business"
              errorMessage={errors.about?.message}
              register={register}
            />
            <div className="flex flex-col gap-2">
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
          </>
        )}
        {screen === 2 && (
          <>
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
              label="WhatsApp Number"
              errorMessage={errors.whatsApp?.message}
              register={register}
            />
          </>
        )}
        {screen === 3 && (
          <>
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
          </>
        )}
        <div className="flex flex-row gap-3 self-end">
          {screen > 0 && (
            <Button
              type="button"
              className="w-fit"
              onClick={() => setScreen((prev) => prev - 1)}
            >
              Back
            </Button>
          )}
          {screen === 3 ? (
            <Button type="submit" className="w-fit" disabled={!isValid}>
              Submit
            </Button>
          ) : (
            <Button
              disabled={isUploading}
              type="button"
              className="w-fit self-end"
              onClick={async () => {
                const isValid = await trigger(fieldsToValidate[screen]);
                if (isValid) {
                  setScreen((prev) => prev + 1);
                }
              }}
            >
              Next
            </Button>
          )}
        </div>
        <Progress value={(screen + 1) * 25} />
      </Form>
    </div>
  );
}
