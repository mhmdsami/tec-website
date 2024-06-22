import { valibotResolver } from "@hookform/resolvers/valibot";
import { Event } from "@prisma-app/client";
import {
  ActionFunction,
  json,
  LoaderFunction,
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
import { EventCard } from "~/components/cards";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import useActionDataWithToast from "~/hooks/use-action-data-with-toast";
import { AppOutletContext } from "~/routes/_app";
import { ActionResponse } from "~/utils/types";
import { db } from "~/utils/db.server";
import { cn } from "~/utils/helpers";
import { AddEventRegistrationSchema, validate } from "~/utils/validation";

type LoaderData = {
  upcomingEvents: Event[];
  pastEvents: Event[];
};

export const loader: LoaderFunction = async (): Promise<
  TypedResponse<LoaderData>
> => {
  const upcomingEvents = await db.event.findMany({
    where: { isCompleted: false },
  });
  const pastEvents = await db.event.findMany({ where: { isCompleted: true } });

  return json({ upcomingEvents, pastEvents });
};

export const action: ActionFunction = async ({ request }): ActionResponse => {
  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());

  const parseRes = validate(body, AddEventRegistrationSchema);
  if (!parseRes.success) {
    return json({ fieldErrors: parseRes.errors }, { status: 400 });
  }

  const { eventId, categoryId, ...details } = parseRes.data;

  const event = await db.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return json({ error: "Event not found" }, { status: 404 });
  }

  const registration = await db.eventRegistration.create({
    data: {
      ...details,
      category: {
        connect: { id: categoryId },
      },
      event: {
        connect: { id: eventId },
      },
    },
  });
  if (!registration) {
    return json({ error: "Failed to register for event" }, { status: 500 });
  }

  return json({ message: "Successfully registered for event" });
};

export default function Events() {
  const submit = useSubmit();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { upcomingEvents, pastEvents } = useLoaderData<LoaderData>();
  const { businessCategories } = useOutletContext<AppOutletContext>();

  const {
    register,
    formState: { errors },
    control,
    handleSubmit,
    reset,
  } = useForm({
    resolver: valibotResolver(AddEventRegistrationSchema),
    defaultValues: {
      eventId: "replace-this-later",
      categoryId: "",
      name: "",
      email: "",
      phone: "",
      businessName: "",
      location: "",
      isMember: "false",
    },
  });

  useActionDataWithToast({
    onMessage: () => {
      reset();
      setMessage("Thank you for registering!");
    },
  });

  return (
    <main className="flex flex-col gap-5">
      {upcomingEvents.length > 0 && (
        <section className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold">Upcoming Events</h1>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map(({ id, isCompleted, title, ...event }) => (
              <EventCard
                key={id}
                id={id}
                title={title}
                isCompleted={isCompleted}
                {...event}
              >
                {!isCompleted && (
                  <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-fit self-end">Register</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader className="px-2">
                        <DialogTitle>Event Registration</DialogTitle>
                        <DialogDescription>
                          Register for{" "}
                          <span className="font-semibold">{title}</span>
                        </DialogDescription>
                      </DialogHeader>
                      {message ? (
                        <div className="flex flex-col gap-3 px-2">
                          <p>{message}</p>
                          <Button
                            className="w-24 self-end"
                            onClick={() => {
                              setIsOpen(false);
                              setMessage("");
                            }}
                          >
                            Close
                          </Button>
                        </div>
                      ) : (
                        <Form
                          className="flex flex-col gap-3 overflow-y-scroll px-2 lg:max-h-[50vh]"
                          onSubmit={handleSubmit((values) =>
                            submit(
                              { ...values, eventId: id },
                              { method: "POST" },
                            ),
                          )}
                        >
                          <Input
                            name="name"
                            label="Name"
                            register={register}
                            errorMessage={errors.name?.message}
                          />
                          <Input
                            name="email"
                            label="Email"
                            register={register}
                            errorMessage={errors.email?.message}
                          />
                          <Input
                            name="phone"
                            label="Phone"
                            register={register}
                            errorMessage={errors.phone?.message}
                          />
                          <div className="flex flex-col gap-2">
                            <Label>Membership</Label>
                            <Controller
                              render={({ field }) => (
                                <Select
                                  onValueChange={field.onChange}
                                  {...field}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a membership" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="true">Member</SelectItem>
                                    <SelectItem value="false">
                                      Non-Member
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                              name="isMember"
                              control={control}
                            />
                            <p
                              className={cn(
                                "hidden text-sm text-destructive",
                                errors.isMember && "block",
                              )}
                            >
                              {errors.isMember?.message}
                            </p>
                          </div>
                          <Input
                            name="businessName"
                            label="Business Name"
                            register={register}
                            errorMessage={errors.businessName?.message}
                          />
                          <div className="flex flex-col gap-2">
                            <Label>Business Category</Label>
                            <Controller
                              render={({ field }) => (
                                <Select
                                  onValueChange={field.onChange}
                                  {...field}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a business type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {businessCategories.map(({ id, name }) => (
                                      <SelectItem key={id} value={id}>
                                        {name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                              name="categoryId"
                              control={control}
                            />
                            <p
                              className={cn(
                                "hidden text-sm text-destructive",
                                errors.categoryId && "block",
                              )}
                            >
                              {errors.categoryId?.message}
                            </p>
                          </div>
                          <Textarea
                            name="location"
                            label="Location"
                            register={register}
                            errorMessage={errors.location?.message}
                          />
                          <Button type="submit" className="w-24 self-end">
                            Submit
                          </Button>
                        </Form>
                      )}
                    </DialogContent>
                  </Dialog>
                )}
              </EventCard>
            ))}
          </div>
        </section>
      )}
      {pastEvents.length > 0 && (
        <section className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold">Past Events</h1>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {pastEvents.map((event, idx) => (
              <EventCard key={idx} {...event} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
