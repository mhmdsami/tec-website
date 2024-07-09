import { Business } from "@prisma-app/client";
import { Link } from "@remix-run/react";
import { Mail, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
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
  name,
  slug,
  owner,
  phone,
  email,
  logo,
}: BusinessCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row gap-3">
        <Avatar className="size-24">
          {logo && <AvatarImage src={logo} alt={name} />}
          <AvatarFallback className="text-3xl">{name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <CardTitle>{name}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {owner}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 overflow-clip">
        <div className="flex items-center gap-2">
          <a href={`tel:${phone}`}>
            <Phone />
          </a>
          <p
            onClick={() => copyToClipboard(phone, "Phone number copied")}
            className="text-sm hover:cursor-pointer lg:text-base"
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
            className="text-sm hover:cursor-pointer lg:text-base"
          >
            {email}
          </p>
        </div>
        <Button asChild>
          <Link to={`/business/${slug}`} prefetch="intent">
            View
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
