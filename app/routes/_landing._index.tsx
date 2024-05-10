import { Blog, Event } from "@prisma-app/client";
import {
  LoaderFunction,
  MetaFunction,
  TypedResponse,
  json,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import EventCard from "~/components/event-card";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import siteConfig from "~/site.config";
import { getLatestBlogs, getLatestEvents } from "~/utils/api.server";

export const meta: MetaFunction = () => {
  return [
    { title: siteConfig.name },
    {
      name: "description",
      content: siteConfig.description,
    },
  ];
};

type LoaderData = {
  events: Event[];
  blogs: Blog[];
};

export const loader: LoaderFunction = async (): Promise<
  TypedResponse<LoaderData>
> => {
  const events = await getLatestEvents();
  const blogs = await getLatestBlogs();

  return json({ events, blogs });
};

export default function Index() {
  const { events, blogs } = useLoaderData<LoaderData>();

  return (
    <div className="mb-10 flex flex-col gap-20">
      <div className="flex h-[85vh] flex-col-reverse items-center justify-center sm:flex-row">
        <div className="sm:basis-1/2">
          <h1 className="text-4xl font-bold lg:text-7xl">
            Tirunelveli Economic Chamber
          </h1>
          <p className="text-sm text-muted-foreground">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
            porta imperdiet turpis nonvarius. Nam et neque lobortis, eleifend
            libero non, finibus magna.
          </p>
        </div>
        <div className="sm:basis-1/2">
          <img src="/tec.png" alt="TEC Logo" />
        </div>
      </div>
      <div className="flex flex-col gap-5 md:flex-row">
        <div className="flex basis-1/2 flex-col">
          <h1 className="text-2xl font-bold lg:text-3xl">About Us</h1>
          <p className="text-lg">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
            porta imperdiet turpis nonvarius. Nam et neque lobortis, eleifend
            libero non, finibus magna. Donec nec nisi vel nunc ultrices
            fermentum. Donec auctor, libero ac ultricies ultricies, nunc nunc
            ultricies.
          </p>
        </div>
        <Carousel className="basis-1/2">
          <CarouselContent>
            {Array.from({ length: 5 }).map((_, index) => (
              <CarouselItem key={index}>
                <Card>
                  <CardContent className="flex aspect-video items-center justify-center p-6">
                    <span className="text-4xl font-semibold">{index + 1}</span>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="mt-5 flex items-center justify-center gap-3">
            <CarouselPrevious className="static translate-y-0" />
            <CarouselNext className="static translate-y-0" />
          </div>
        </Carousel>
      </div>
      <div className="flex flex-col gap-5 md:flex-row">
        <div className="flex basis-1/2 flex-col items-center gap-5 rounded-2xl border-4 border-secondary p-10 text-center">
          <h1 className="text-2xl font-bold lg:text-3xl">Search</h1>
          <p className="text-lg">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
            porta imperdiet turpis nonvarius. Nam et neque lobortis, eleifend
            libero non, finibus magna.
          </p>
          <Button asChild className="w-fit">
            <Link to="/members">Search a Business</Link>
          </Button>
        </div>
        <div className="flex basis-1/2 flex-col items-center gap-5 rounded-2xl bg-secondary p-10 text-center">
          <h1 className="text-2xl font-bold lg:text-3xl">Join Us</h1>
          <p className="text-lg">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
            porta imperdiet turpis nonvarius. Nam et neque lobortis, eleifend
            libero non, finibus magna. Donec nec nisi vel nunc ultrices
            fermentum. Donec auctor, libero ac ultricies ultricies, nunc nunc
            ultricies.
          </p>
          <Button asChild className="w-fit">
            <Link to="/sign-up">Sign Up as a Business</Link>
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <h1 className="text-2xl font-bold lg:text-3xl">Latest Events</h1>
        <div className="grid gap-10 md:grid-cols-2">
          {events.map((event, idx) => (
            <EventCard key={idx} {...event} />
          ))}
        </div>
      </div>
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold lg:text-3xl">Blogs</h1>
      </div>
    </div>
  );
}
