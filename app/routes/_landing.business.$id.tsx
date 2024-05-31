import { Business, Service } from "@prisma-app/client";
import {
  ActionFunction,
  LoaderFunction,
  TypedResponse,
  json,
} from "@remix-run/node";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { useForm } from "react-hook-form";
import Profile from "~/components/profile";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import useActionDataWithToast from "~/hooks/use-action-data-with-toast";
import { ActionResponse } from "~/types";
import {
  getBusinessById,
  getServicesByBusinessId,
  makeEnquiry,
} from "~/utils/api.server";
import { errorHandler } from "~/utils/error.server";
import { EnquirySchema, validate } from "~/utils/validation";

type LoaderData = {
  business: Business;
  services: Service[];
};

export const loader: LoaderFunction = async ({
  params,
}): Promise<TypedResponse<LoaderData>> => {
  const id = params.id;

  if (!id) {
    throw json({ message: "Business id not found" }, { status: 400 });
  }

  const business = await getBusinessById(id);
  if (!business) {
    throw json({ message: "Business not found" }, { status: 404 });
  }

  const services = await getServicesByBusinessId(business.id);

  return json({ business, services });
};

export const action: ActionFunction = async ({
  request,
  params,
}): ActionResponse => {
  const businessId = params.id;
  if (!businessId) {
    return json({ message: "Business id not found" }, { status: 400 });
  }

  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());
  const parseRes = validate(body, EnquirySchema);

  if (parseRes.success) {
    try {
      await makeEnquiry(parseRes.data, businessId);
      return json({ message: "Enquiry sent" });
    } catch (error) {
      const { status, message } = errorHandler(error as Error);
      return json({ error: message }, { status });
    }
  }

  return json({ fieldErrors: parseRes.errors }, { status: 400 });
};

export default function BusinessProfile() {
  const submit = useSubmit();
  const { business, services } = useLoaderData<LoaderData>();

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm({
    resolver: valibotResolver(EnquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const actionData = useActionDataWithToast({
    onMessage: reset,
  });

  return (
    <main className="flex min-h-[80vh] w-full flex-col items-center justify-center gap-5 overflow-scroll">
      <Profile {...business} services={services}>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Enquire</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enquire</DialogTitle>
            </DialogHeader>
            <Form
              className="flex flex-col gap-3"
              onSubmit={handleSubmit((values) =>
                submit(values, { method: "POST" }),
              )}
            >
              <Input
                name="name"
                label="Name"
                errorMessage={errors.name?.message}
                register={register}
              />
              <Input
                name="email"
                label="Email"
                type="email"
                errorMessage={errors.email?.message}
                register={register}
              />
              <Input
                name="phone"
                label="Phone"
                type="tel"
                errorMessage={errors.phone?.message}
                register={register}
              />
              <Textarea
                name="message"
                label="Message"
                errorMessage={errors.message?.message}
                register={register}
              />
              <Button type="submit" className="w-fit self-end">
                Submit
              </Button>
            </Form>
          </DialogContent>
        </Dialog>
      </Profile>
    </main>
  );
}
