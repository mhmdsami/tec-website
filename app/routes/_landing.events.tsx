import { Event } from "@prisma-app/client";
import { json, LoaderFunction, TypedResponse } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import EventCard from "~/components/event-card";
import { getAllEvents } from "~/utils/api.server";

type LoaderData = {
  events: Event[];
};

export const loader: LoaderFunction = async (): Promise<
  TypedResponse<LoaderData>
> => {
  const events = await getAllEvents();

  return json({ events });
};

export default function Events() {
  const { events } = useLoaderData<LoaderData>();

  return (
    <main className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event, idx) => (
        <EventCard key={idx} {...event} />
      ))}
    </main>
  );
}
