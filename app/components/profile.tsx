import { Business } from "@prisma-app/client";
import { Instagram, MessageCircle, Phone } from "lucide-react";
import { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface ProfileProps extends Omit<Business, "createdAt"> {
  children?: ReactNode;
  headerChildren?: ReactNode;
}

export default function Profile({
  name,
  tagline,
  about,
  logo,
  instagram,
  whatsApp,
  phone,
  children,
  coverImage,
  headerChildren
}: ProfileProps) {
  return (
    <Card className="w-[500px]">
      <img src={coverImage || ""} alt={name} className="aspect-video object-cover rounded-t-lg" />
      <CardHeader className="flex flex-row justify-between">
        <div className="flex flex-col gap-2">
          <Avatar className="-mt-20 h-32 w-32 self-start">
            {logo && <AvatarImage src={logo} alt={name} />}
            <AvatarFallback className="text-3xl">{name[0]}</AvatarFallback>
          </Avatar>
          <CardTitle>{name}</CardTitle>
          <CardDescription>{tagline}</CardDescription>
        </div>
        {headerChildren}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {children}
        <p>{about}</p>
        <div className="flex gap-2">
          <a href={instagram}>
            <Instagram />
          </a>
          <a href={`https://wa.me/${whatsApp}`}>
            <MessageCircle />
          </a>
          <a href={`tel:${phone}`}>
            <Phone />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
