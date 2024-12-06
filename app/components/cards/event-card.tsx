import { Event } from "@prisma-app/client";
import { Calendar } from "lucide-react";
import React from "react";
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

interface EventCardProps extends Omit<Event, "date" | "createdAt"> {
  date: string;
  createdAt: string;
  children?: React.ReactNode;
}

export default function EventCard({
  title,
  description,
  images,
  date,
  children,
}: EventCardProps) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          <span className="text-lg">{description}</span>
          <span className="flex items-center gap-1">
            <Calendar size={16} />{" "}
            {new Date(date).toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <Carousel>
          <CarouselContent>
            {images.map(({ url, description }, idx) => (
              <CarouselItem key={idx}>
                <img
                  src={url}
                  alt={description || ""}
                  className="aspect-video object-contain"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {images.length > 1 && (
            <div className="mt-5 flex items-center justify-center gap-3">
              <CarouselPrevious className="static translate-y-0" />
              <CarouselNext className="static translate-y-0" />
            </div>
          )}
        </Carousel>
        {children}
      </CardContent>
    </Card>
  );
}
