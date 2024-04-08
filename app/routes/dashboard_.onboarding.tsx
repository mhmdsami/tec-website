import {
  ActionFunction,
  json,
  LoaderFunction,
  MetaFunction,
  redirect,
  TypedResponse,
} from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import {
  createBusiness,
  getBusinessByOwnerId,
  getBusinessTypes,
  getUserById,
} from "~/utils/api.server";
import siteConfig from "~/site.config";
import { Business, BusinessType } from "@prisma-app/client";
import {
  BusinessOnboardingData,
  BusinessOnboardingSchema,
  validateBusinessOnboarding,
} from "~/utils/validation";
import { Controller, useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Progress } from "~/components/ui/progress";
import { useState } from "react";

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

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const user = await getUserById(userId);
  if (!user) return redirect("/sign-in");

  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());

  const parseRes = validateBusinessOnboarding(body);
  if (parseRes.success) {
    await createBusiness(parseRes.data, user.id);
    return redirect("/dashboard");
  }

  return json({ fieldErrors: parseRes.errors }, { status: 400 });
};

export default function OnboardingForm() {
  const [screen, setScreen] = useState(0);
  const { business, businessTypes } = useLoaderData<LoaderData>();
  const submit = useSubmit();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
  } = useForm<BusinessOnboardingData>({
    resolver: valibotResolver(BusinessOnboardingSchema),
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
  const onSubmit = async (data: BusinessOnboardingData) =>
    submit(data, { method: "post" });

  const fieldsToValidate: Array<Array<keyof BusinessOnboardingData>> = [
    ["name", "typeId"],
    ["tagline", "about"],
    ["location", "instagram", "whatsApp"],
    ["email", "phone"],
  ];

  return (
    <div className="flex flex-col gap-5 w-full">
      <h1 className="text-2xl font-bold">Business Onboarding</h1>
      <Form
        className="flex flex-col gap-3 max-w-[400px] w-full mx-auto h-[70vh] justify-center"
        onSubmit={handleSubmit(onSubmit)}
      >
        {screen === 0 && (
          <>
            <div className="flex flex-col gap-2">
              <Label>Business Name</Label>
              <Input placeholder="Business Name" {...register("name")} />
              <p
                className={cn(
                  "text-sm text-destructive hidden",
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
                  "text-sm text-destructive hidden",
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
            <div className="flex flex-col gap-2">
              <Label>Tagline</Label>
              <Input placeholder="Tagline" {...register("tagline")} />
              <p
                className={cn(
                  "text-sm text-destructive hidden",
                  errors.tagline && "block",
                )}
              >
                {errors.tagline?.message}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label>About</Label>
              <Textarea placeholder="About Business" {...register("about")} />
              <p
                className={cn(
                  "text-sm text-destructive hidden",
                  errors.about && "block",
                )}
              >
                {errors.about?.message}
              </p>
            </div>
          </>
        )}
        {screen === 2 && (
          <>
            <div className="flex flex-col gap-2">
              <Label>Location</Label>
              <Input placeholder="Location" {...register("location")} />
              <p
                className={cn(
                  "text-sm text-destructive hidden",
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
                  "text-sm text-destructive hidden",
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
                  "text-sm text-destructive hidden",
                  errors.whatsApp && "block",
                )}
              >
                {errors.whatsApp?.message}
              </p>
            </div>
          </>
        )}
        {screen === 3 && (
          <>
            <div className="flex flex-col gap-2">
              <Label>Email</Label>
              <Input placeholder="Email" {...register("email")} />
              <p
                className={cn(
                  "text-sm text-destructive hidden",
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
                  "text-sm text-destructive hidden",
                  errors.phone && "block",
                )}
              >
                {errors.phone?.message}
              </p>
            </div>
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
