import { Event } from "@prisma-app/client";
import { Calendar } from "lucide-react";
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
}

export default function EventCard({
  title,
  description,
  images,
  date,
}: EventCardProps) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          <h1 className="text-lg">{description}</h1>
          <h2 className="flex items-center gap-1">
            <Calendar size={16} />{" "}
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
              <CarouselItem key={idx}>
                <img
                  src={url}
                  alt={description || ""}
                  className="aspect-video object-contain"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {images.length > 0 && (
            <div className="mt-5 flex items-center justify-center gap-3">
              <CarouselPrevious className="static translate-y-0" />
              <CarouselNext className="static translate-y-0" />
            </div>
          )}
        </Carousel>
      </CardContent>
    </Card>
  );
}
