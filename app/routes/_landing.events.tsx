import { Event } from "@prisma-app/client";
import { json, LoaderFunction, TypedResponse } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { getAllEvents } from "~/utils/api.server";
import { Calendar } from "lucide-react";

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
    <main className="grid grid-cols-3 gap-5">
      {events.map((event) => (
        <EventCard {...event} />
      ))}
    </main>
  );
}

interface EventCardProps extends Omit<Event, "date" | "createdAt"> {
  date: string;
  createdAt: string;
}

function EventCard({ title, description, images, date }: EventCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          <h1 className="text-lg">{description}</h1>
          <h2 className="flex gap-1 items-center">
            <Calendar size={16} /> {" "}
            {new Date(date).toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h2>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel>
          <CarouselContent>
            {images.map(({ url, description }, idx) => (
              <CarouselItem>
                <img src={url} alt={description || ""} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="mt-5 flex items-center justify-center gap-3">
            <CarouselPrevious className="static translate-y-0" />
            <CarouselNext className="static translate-y-0" />
          </div>
        </Carousel>
      </CardContent>
    </Card>
  );
}
