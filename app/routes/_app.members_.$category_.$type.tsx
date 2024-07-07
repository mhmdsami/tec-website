import { valibotResolver } from "@hookform/resolvers/valibot";
import { Business, BusinessType, User } from "@prisma-app/client";
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
import BusinessCard from "~/components/cards/business-card";
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
  businessType: BusinessType;
  businesses: Array<Business & { owner: User }>;
};

export const loader: LoaderFunction = async ({
  params,
}): Promise<TypedResponse<LoaderData>> => {
  const category = params.category;
  if (!category) {
    throw json({ message: "Category not found" }, { status: 400 });
  }

  const type = params.type;
  if (!type) {
    throw json({ message: "Type not found" }, { status: 400 });
  }

  const businessCategory = await db.businessCategory.findUnique({
    where: { slug: category },
    include: { types: true },
  });
  if (!businessCategory) {
    throw json({ message: "Invalid business category" }, { status: 404 });
  }

  const businessType = businessCategory.types.find((t) => t.slug === type);
  if (!businessType) {
    throw json({ message: "Invalid type of business" }, { status: 404 });
  }

  const businesses = await db.business.findMany({
    where: { typeId: businessType.id, isVerified: true },
    include: { owner: true },
  });

  return json({ businessType, businesses });
};

export const action: ActionFunction = async ({
  request,
  params,
}): ActionResponse => {
  const category = params.category;
  if (!category) {
    throw json({ message: "Category not found" }, { status: 400 });
  }

  const type = params.type;
  if (!type) {
    throw json({ message: "Type not found" }, { status: 400 });
  }

  const userId = await requireUserId(request, `/members/${category}/${type}`);

  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());
  const parseRes = validate(body, EnquirySchema);

  if (parseRes.success) {
    try {
      await db.enquiry.create({
        data: {
          ...parseRes.data,
          businessType: {
            connect: { slug: type },
          },
          user: {
            connect: { id: userId },
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

export default function Members() {
  const { isLoggedIn } = useOutletContext<AppOutletContext>();
  const submit = useSubmit();
  const [isOpen, setIsOpen] = useState(false);
  const {
    businessType: { name },
    businesses: data,
  } = useLoaderData<LoaderData>();
  const [businesses, setBusinesses] = useState(data);

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
    <main className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">{name}</h1>
      <div className="flex items-center justify-between">
        <Input
          name="name"
          placeholder="Search by name"
          className="w-full sm:w-[250px]"
          onChange={(e) => {
            const value = e.target.value.toLowerCase();
            setBusinesses(
              businesses.filter((business) =>
                business.name.toLowerCase().includes(value),
              ),
            );
          }}
        />
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
      </div>
      {businesses.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {businesses.map(({ owner: { name }, typeId, ...business }, idx) => (
            <BusinessCard {...business} owner={name} />
          ))}
        </div>
      ) : (
        <p>No businesses found</p>
      )}
    </main>
  );
}
