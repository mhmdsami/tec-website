import { valibotResolver } from "@hookform/resolvers/valibot";
import { Business, Testimonial } from "@prisma-app/client";
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
import { sendEmail } from "~/services/mailer.server";
import BusinessEnquiry from "~/templates/business-enquiry";
import { db } from "~/utils/db.server";
import { errorHandler } from "~/utils/helpers.server";
import { requireUserId } from "~/utils/session.server";
import { ActionResponse } from "~/utils/types";
import { EnquirySchema, TestimonialSchema, validate } from "~/utils/validation";

type LoaderData = {
  business: Business & {
    testimonials: Array<Testimonial & { author: Business }>;
  };
};

export const loader: LoaderFunction = async ({
  params,
}): Promise<TypedResponse<LoaderData>> => {
  const slug = params.slug;

  if (!slug) {
    throw json({ message: "Slug not found" }, { status: 400 });
  }

  const business = await db.business.findUnique({
    where: { slug },
    include: {
      testimonials: {
        include: {
          author: true,
        },
      },
    },
  });
  if (!business) {
    throw json({ message: "Business not found" }, { status: 404 });
  }

  return json({ business });
};

export const action: ActionFunction = async ({
  request,
  params,
}): ActionResponse => {
  const slug = params.slug;
  if (!slug) {
    return json({ message: "Slug not found" }, { status: 400 });
  }

  const business = await db.business.findUnique({
    where: { slug },
    include: { owner: true },
  });
  if (!business) {
    return json({ message: "Business not found" }, { status: 404 });
  }

  const userId = await requireUserId(request, `/business/${slug}`);
  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());
  const action = formData.get("action");

  switch (action) {
    case "enquiry": {
      const parseRes = validate(body, EnquirySchema);
      if (!parseRes.success) {
        return json({ fieldErrors: parseRes.errors }, { status: 400 });
      }

      try {
        await db.businessEnquiry.create({
          data: {
            ...parseRes.data,
            user: {
              connect: { id: userId },
            },
            business: {
              connect: { id: business.id },
            },
          },
        });
        await sendEmail(
          BusinessEnquiry,
          {
            name: business.owner.name,
            enquiry: parseRes.data.message,
          },
          business.owner.email,
          "New Enquiry",
        );
        return json({ message: "Enquiry sent" });
      } catch (error) {
        const { status, message } = errorHandler(error as Error);
        return json({ error: message }, { status });
      }
    }

    case "testimonial": {
      if (userId === business.owner.id) {
        return json({ error: "You cannot add testimonial to yourself" });
      }

      const testimonialProvidedAlready = await db.testimonial.count({
        where: {
          author: {
            owner: {
              id: userId,
            },
          },
          businessId: business.id,
        },
      });

      if (testimonialProvidedAlready) {
        return json({
          error: "You have already provided testimonial for this business ",
        });
      }

      const parseRes = validate(body, TestimonialSchema);
      if (!parseRes.success) {
        return json({ fieldErrors: parseRes.errors }, 400);
      }

      const testimonial = await db.testimonial.create({
        data: {
          ...parseRes.data,
          author: {
            connect: {
              ownerId: userId,
            },
          },
          business: {
            connect: { id: business.id },
          },
        },
      });

      if (testimonial) {
        return json({ message: "Testimonial added successfully!" });
      }

      return json({ error: "Failed to add testimonial" }, 500);
    }

    default:
      return json({ error: "Invalid action" }, { status: 400 });
  }
};

export default function BusinessProfile() {
  const { isLoggedIn, user } = useOutletContext<AppOutletContext>();
  const submit = useSubmit();
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [isTestimonialOpen, setIsTestimonialOpen] = useState(false);
  const { business } = useLoaderData<LoaderData>();

  const {
    register: enquiryRegister,
    formState: { errors: enquiryErrors },
    reset: enquiryReset,
    handleSubmit: handleEnquirySubmit,
  } = useForm({
    resolver: valibotResolver(EnquirySchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: "",
      message: "",
    },
  });

  const {
    handleSubmit: handleTestimonialSubmit,
    register: testimonialRegister,
    formState: { errors: testimonialErrors },
    reset: testimonialReset,
  } = useForm({
    resolver: valibotResolver(TestimonialSchema),
    defaultValues: {
      comment: "",
    },
  });

  useActionDataWithToast({
    onMessage: () => {
      setIsEnquiryOpen(false);
      setIsTestimonialOpen(false);
      enquiryReset();
      testimonialReset();
    },
  });

  return (
    <main className="flex min-h-[80vh] w-full flex-col items-center justify-center gap-5 overflow-scroll">
      <Profile {...business}>
        {isLoggedIn ? (
          <div className="flex gap-2">
            <Dialog open={isEnquiryOpen} onOpenChange={setIsEnquiryOpen}>
              <DialogTrigger asChild>
                <Button className="grow">Enquire</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enquire</DialogTitle>
                </DialogHeader>
                <Form
                  className="flex flex-col gap-3"
                  onSubmit={handleEnquirySubmit((values) =>
                    submit(
                      { action: "enquiry", ...values },
                      { method: "POST" },
                    ),
                  )}
                >
                  <Input
                    name="name"
                    label="Name"
                    errorMessage={enquiryErrors.name?.message}
                    register={enquiryRegister}
                  />
                  <Input
                    name="email"
                    label="Email"
                    type="email"
                    errorMessage={enquiryErrors.email?.message}
                    register={enquiryRegister}
                  />
                  <Input
                    name="phone"
                    label="Phone"
                    type="tel"
                    errorMessage={enquiryErrors.phone?.message}
                    register={enquiryRegister}
                  />
                  <Textarea
                    name="message"
                    label="Message"
                    errorMessage={enquiryErrors.message?.message}
                    register={enquiryRegister}
                  />
                  <Button type="submit" className="w-fit self-end">
                    Submit
                  </Button>
                </Form>
              </DialogContent>
            </Dialog>
            {user?.type === "BUSINESS" && (
              <Dialog
                open={isTestimonialOpen}
                onOpenChange={setIsTestimonialOpen}
              >
                <DialogTrigger asChild>
                  <Button className="grow">Add Testimonial</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Testimonial</DialogTitle>
                  </DialogHeader>
                  <Form
                    className="flex flex-col gap-3"
                    onSubmit={handleTestimonialSubmit((values) =>
                      submit(
                        { action: "testimonial", ...values },
                        { method: "POST" },
                      ),
                    )}
                  >
                    <Textarea
                      name="comment"
                      label="Comment"
                      errorMessage={testimonialErrors.comment?.message}
                      register={testimonialRegister}
                    />
                    <Button type="submit" className="w-fit self-end">
                      Submit
                    </Button>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>
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
