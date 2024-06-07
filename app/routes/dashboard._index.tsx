import { valibotResolver } from "@hookform/resolvers/valibot";
import { ActionFunction, json } from "@remix-run/node";
import { Form, useOutletContext, useSubmit } from "@remix-run/react";
import { addYears } from "date-fns";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import ImageUpload from "~/components/image-upload";
import Profile from "~/components/profile";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import useActionDataWithToast from "~/hooks/use-action-data-with-toast";
import { DashboardOutletContext } from "~/routes/dashboard";
import { ActionResponse } from "~/types";
import { updateBusiness } from "~/utils/api.server";
import { cn } from "~/utils/helpers";
import { requireUserId } from "~/utils/session.server";
import { BusinessUpdateSchema, validate } from "~/utils/validation";

export const action: ActionFunction = async ({ request }): ActionResponse => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());

  const parseRes = validate(body, BusinessUpdateSchema);
  if (parseRes.success) {
    await updateBusiness(userId, parseRes.data);
    return json({ message: "Business updated" });
  }

  return json({ fieldErrors: parseRes.errors }, { status: 400 });
};

export default function Dashboard() {
  const submit = useSubmit();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const { business } = useOutletContext<DashboardOutletContext>();

  useActionDataWithToast({
    onMessage: () => setIsOpen(false),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
    watch,
  } = useForm({
    resolver: valibotResolver(BusinessUpdateSchema),
    defaultValues: {
      name: business?.name,
      tagline: business?.tagline,
      about: business?.about,
      logo: business?.logo,
      coverImage: business?.coverImage || "",
      location: business?.location,
      instagram: business?.instagram,
      whatsApp: business?.whatsApp,
      facebook: business?.facebook || "",
      linkedIn: business?.linkedIn || "",
      email: business?.email,
      phone: business?.phone,
    },
  });

  return (
    <main className="flex w-full grow flex-col items-center justify-center overflow-scroll">
      <Profile
        {...business}
        headerChildren={
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="self-end">
                <Badge className="h-fit w-fit hover:bg-primary">
                  {addYears(business.createdAt, 1).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Validity</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        }
      >
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button>Edit</Button>
          </SheetTrigger>
          <SheetContent className="overflow-scroll">
            <SheetHeader>
              <SheetTitle>Edit Business Profile</SheetTitle>
              <SheetDescription>
                Make changes to your business profile
              </SheetDescription>
            </SheetHeader>
            <Form
              className="mx-auto mt-3 flex flex-col justify-center gap-3"
              onSubmit={handleSubmit((data) =>
                submit(data, { method: "post" }),
              )}
            >
              <Input name="name" label="Name" register={register} />
              <Input
                name="tagline"
                label="Tagline"
                errorMessage={errors.tagline?.message}
                register={register}
              />
              <Textarea
                name="about"
                label="About"
                errorMessage={errors.tagline?.message}
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
                      isUploading={isLogoUploading}
                      setIsUploading={setIsLogoUploading}
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
              <div className="flex flex-col gap-2">
                <Label>Cover Image</Label>
                <Controller
                  control={control}
                  name="coverImage"
                  render={({ field }) => (
                    <ImageUpload
                      imageUrl={watch("coverImage")}
                      onChange={field.onChange}
                      folder="coverImage"
                      isUploading={isCoverUploading}
                      setIsUploading={setIsCoverUploading}
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
                name="facebook"
                label="Facebook"
                errorMessage={errors.facebook?.message}
                register={register}
              />
              <Input
                name="linkedIn"
                label="LinkedIn"
                errorMessage={errors.linkedIn?.message}
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
              <Button
                type="submit"
                className="w-fit self-end"
                disabled={!isDirty || isLogoUploading || isCoverUploading}
              >
                Save
              </Button>
            </Form>
          </SheetContent>
        </Sheet>
      </Profile>
    </main>
  );
}
