import { Blog, Event } from "@prisma-app/client";
import {
  LoaderFunction,
  MetaFunction,
  TypedResponse,
  json,
} from "@remix-run/node";
import { Link, useLoaderData, useOutletContext } from "@remix-run/react";
import Autoplay from "embla-carousel-autoplay";
import { BlogCard, EventCard } from "~/components/cards";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { AppOutletContext } from "~/routes/_app";
import siteConfig from "~/site.config";
import { db } from "~/utils/db.server";

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
  const events = await db.event.findMany({
    take: 2,
    orderBy: { createdAt: "desc" },
  });
  const blogs = await db.blog.findMany({
    take: 2,
    orderBy: { createdAt: "desc" },
  });

  return json({ events, blogs });
};

export default function Index() {
  const { events, blogs } = useLoaderData<LoaderData>();
  const { isLoggedIn } = useOutletContext<AppOutletContext>();

  return (
    <main className="mb-10 flex flex-col gap-20">
      <div className="flex h-[85vh] flex-col items-center justify-center gap-20 sm:flex-row lg:gap-0">
        <div className="sm:basis-1/2">
          <h1 className="text-4xl font-bold lg:text-7xl">
            Tirunelveli Economic Chamber
          </h1>
          <p className="text-lg text-muted-foreground">
            A chamber of commerce or business association to promote the
            economic interests of its members and the broader community.
          </p>
        </div>
        <Carousel
          className="sm:basis-1/2"
          plugins={[
            Autoplay({
              delay: 3000,
              stopOnInteraction: true,
              stopOnMouseEnter: true,
            }),
          ]}
        >
          <CarouselContent>
            <CarouselItem className="flex aspect-video items-center justify-center p-6">
              <img src="/tec.png" alt="TEC Logo" />
            </CarouselItem>
            {events.map(
              ({ images }, idx) =>
                images.length > 0 && (
                  <CarouselItem key={idx}>
                    <Card>
                      <CardContent className="flex aspect-video flex-col items-center justify-center gap-2 p-6">
                        <img
                          src={images[0].url}
                          alt={images[0].description || "Event image"}
                          className="aspect-video object-contain"
                        />
                        <Button asChild className="self-end">
                          <Link to="/events" prefetch="intent">
                            View Event
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ),
            )}
          </CarouselContent>
        </Carousel>
      </div>
      <div className="flex flex-col gap-5 md:flex-row" id="about">
        <div className="flex basis-1/2 flex-col gap-2">
          <h1 className="text-2xl font-bold lg:text-3xl">About Us</h1>
          <h2 className="text-2xl font-semibold">
            Welcome to Tirunelveli Economic Chamber
          </h2>
          <p className="text-lg">
            At TEC, we are dedicated to provide business connections and promote
            trade and investments. Since our inception in 2023, we have been
            committed to provide platforms for business support and services
            striving to create integrated sustainable development plan
          </p>
          <h2 className="text-2xl font-semibold">Vision</h2>
          <p className="text-lg">
            Fostering the creation and growth of every individual as the
            cornerstone of societal advancement.
          </p>
          <h2 className="text-2xl font-semibold">Mission</h2>
          <p className="text-lg">
            Collaborating with others to advance society, fostering partnerships
            instead of competition, and supporting the growth of those who
            provide social services
          </p>
        </div>
        <Carousel
          className="basis-1/2"
          plugins={[
            Autoplay({
              delay: 3000,
            }),
          ]}
        >
          <CarouselContent>
            {Array.from({ length: 9 }).map((_, index) => (
              <CarouselItem key={index}>
                <img
                  src={`/images/${index + 1}.jpeg`}
                  alt="about us image"
                  className="aspect-video object-cover rounded-lg"
                />
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
        <div className="flex basis-1/2 flex-col items-center gap-5 rounded-2xl border-4 border-secondary p-10 text-justify">
          <h1 className="text-2xl font-bold lg:text-3xl">Search</h1>
          <p className="text-lg">
            Welcome to the Economic Chamber’s Search Facility! Our comprehensive
            search tool is designed to help you quickly find the information,
            resources, and connections you need to thrive in today’s dynamic
            business environment.
          </p>
          <Button asChild className="w-fit">
            <Link to="/members" prefetch="intent">
              Search a Business
            </Link>
          </Button>
        </div>
        <div className="flex basis-1/2 flex-col items-center gap-5 rounded-2xl bg-secondary p-10 text-justify">
          <h1 className="text-2xl font-bold lg:text-3xl">Join Us</h1>
          <p className="text-lg">
            Become a member of Tirunelveli Economic Chamber!
            <br /> <br />
            At TEC, we believe that the strength of our community lies in the
            diversity and engagement of our members. By joining us, you become
            part of a vibrant network of businesses and professionals dedicated
            to driving economic growth and development. Whether you are a
            startup, SME, or a large enterprise, our chamber offers valuable
            resources, opportunities, and support to help you succeed.
            <br /> <br />
            Joining our chamber is Easy-Peasy. Just sign in and become a member
            and enjoy our services!
          </p>
          <Button asChild className="w-fit">
            {isLoggedIn ? (
              <Link to="/dashboard" prefetch="intent">
                Dashboard
              </Link>
            ) : (
              <Link to="/sign-up" prefetch="intent">
                Sign Up
              </Link>
            )}
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <h1 className="text-2xl font-bold lg:text-3xl">Latest Events</h1>
        <div className="grid gap-10 md:grid-cols-2">
          {events.map((event, idx) => (
            <EventCard key={idx} {...event}>
              <Button asChild className="self-end">
                <Link to="/events" prefetch="intent">
                  View Event
                </Link>
              </Button>
            </EventCard>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <h1 className="text-2xl font-bold lg:text-3xl">Latest Blogs</h1>
        <div className="grid gap-10 md:grid-cols-2">
          {blogs.map((blog, idx) => (
            <BlogCard key={idx} {...blog} />
          ))}
        </div>
      </div>
    </main>
  );
}
