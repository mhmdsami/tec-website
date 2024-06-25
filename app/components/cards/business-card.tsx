import { Business } from "@prisma-app/client";
import { Link } from "@remix-run/react";
import { Mail, Phone } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { copyToClipboard } from "~/utils/helpers.client";

interface BusinessCardProps extends Omit<Business, "typeId" | "createdAt"> {
  owner: string;
}

export default function BusinessCard({
  id,
  name,
  owner,
  phone,
  email,
}: BusinessCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {owner}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <a href={`tel:${phone}`}>
            <Phone />
          </a>
          <p
            onClick={() => copyToClipboard(phone, "Phone number copied")}
            className="hover:cursor-pointer"
          >
            {phone}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href={`tel:${phone}`}>
            <Mail />
          </a>
          <p
            onClick={() => copyToClipboard(email, "Email copied")}
            className="hover:cursor-pointer"
          >
            {email}
          </p>
        </div>
        <Button asChild>
          <Link to={`/business/${id}`} prefetch="intent">
            View
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
