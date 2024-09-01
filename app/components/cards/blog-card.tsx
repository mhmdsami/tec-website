import { Blog } from "@prisma-app/client";
import { Link } from "@remix-run/react";
import { Calendar } from "lucide-react";
import Markdown from "react-markdown";
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
        <CardDescription className="flex flex-col flex-wrap justify-between sm:flex-row">
          <span className="text-lg">{description}</span>
          <span className="flex items-center gap-1">
            <Calendar size={16} className="" />{" "}
            {new Date(createdAt).toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Markdown className="line-clamp-3">{content}</Markdown>
        <Button className="self-end" asChild>
          <Link to={`/blog/${id}`} prefetch="intent">
            Read More
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
