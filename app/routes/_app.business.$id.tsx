import { valibotResolver } from "@hookform/resolvers/valibot";
import { Business } from "@prisma-app/client";
import {
  ActionFunction,
  LoaderFunction,
  TypedResponse,
  json,
} from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useOutletContext,
  useSubmit,
} from "@remix-run/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Profile from "~/components/profile";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import useActionDataWithToast from "~/hooks/use-action-data-with-toast";
import { AppOutletContext } from "~/routes/_app";
import { db } from "~/utils/db.server";
import { errorHandler } from "~/utils/helpers.server";
import { requireUserId } from "~/utils/session.server";
import { ActionResponse } from "~/utils/types";
import { EnquirySchema, validate } from "~/utils/validation";

type LoaderData = {
  business: Business;
};

export const loader: LoaderFunction = async ({
  params,
}): Promise<TypedResponse<LoaderData>> => {
  const id = params.id;

  if (!id) {
    throw json({ message: "Business id not found" }, { status: 400 });
  }

  const business = await db.business.findUnique({ where: { id } });
  if (!business) {
    throw json({ message: "Business not found" }, { status: 404 });
  }

  return json({ business });
};

export const action: ActionFunction = async ({
  request,
  params,
}): ActionResponse => {
  const businessId = params.id;
  if (!businessId) {
    return json({ message: "Business id not found" }, { status: 400 });
  }

  const userId = await requireUserId(request, `/business/${businessId}`);

  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());
  const parseRes = validate(body, EnquirySchema);

  if (parseRes.success) {
    try {
      await db.businessEnquiry.create({
        data: {
          ...parseRes.data,
          user: {
            connect: { id: userId },
          },
          business: {
            connect: { id: businessId },
          },
        },
      });
      return json({ message: "Enquiry sent" });
    } catch (error) {
      const { status, message } = errorHandler(error as Error);
      return json({ error: message }, { status });
    }
  }

  return json({ fieldErrors: parseRes.errors }, { status: 400 });
};

export default function BusinessProfile() {
  const { isLoggedIn } = useOutletContext<AppOutletContext>();
  const submit = useSubmit();
  const [isOpen, setIsOpen] = useState(false);
  const { business } = useLoaderData<LoaderData>();

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

  useActionDataWithToast({
    onMessage: () => {
      setIsOpen(false);
      reset();
    },
  });

  return (
    <main className="flex min-h-[80vh] w-full flex-col items-center justify-center gap-5 overflow-scroll">
      <Profile {...business}>
        {isLoggedIn ? (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
        ) : (
          <Form method="POST">
            <Button type="submit" className="w-full">
              Sign in to enquire
            </Button>
          </Form>
        )}
      </Profile>
    </main>
  );
}
