import { Blog } from "@prisma-app/client";
import { Link } from "@remix-run/react";
import { Calendar } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface BlogCardProps extends Omit<Blog, "createdAt"> {
  createdAt: string;
}

export default function EventCard({
  id,
  title,
  description,
  content,
  createdAt,
}: BlogCardProps) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="flex flex-col justify-between sm:flex-row">
          <h1 className="text-lg">{description}</h1>
          <h2 className="flex items-center gap-1">
            <Calendar size={16} />{" "}
            {new Date(createdAt).toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h2>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="line-clamp-3">{content}</p>
        <Button className="self-end">
          <Link to={`/blog/${id}`}>Read More</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
