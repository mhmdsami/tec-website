import { Business } from "@prisma-app/client";
import { Instagram, MessageCircle, Phone } from "lucide-react";
import { ReactNode } from "react";
import { CopiableInput } from "~/components/copiable-input";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import siteConfig from "~/site.config";
import { copyToClipboard } from "~/utils/helpers.client";

interface ProfileProps extends Omit<Business, "createdAt"> {
  children?: ReactNode;
  headerChildren?: ReactNode;
}

export default function Profile({
  id,
  name,
  tagline,
  about,
  logo,
  instagram,
  whatsApp,
  phone,
  children,
  coverImage,
  headerChildren,
}: ProfileProps) {
  const url = `${siteConfig.baseUrl}/business/${id}`;

  return (
    <Card className="w-[500px]">
      <img
        src={coverImage || ""}
        alt={name}
        className="aspect-video rounded-t-lg object-cover"
      />
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
        <p>{about}</p>
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
        <div className="flex gap-2">
          <a href={instagram}>
            <Instagram />
          </a>
          <a href={`https://wa.me/${whatsApp}`}>
            <MessageCircle />
          </a>
        </div>
        {children}
        <CopiableInput value={url} />
        <div className="flex justify-around items-center gap-2 rounded-lg bg-secondary p-5">
          <div className="flex flex-col gap-2">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${url}`}
              alt="qrcode"
              className="h-40 w-40 rounded-s"
            />
            <Button asChild className="w-40">
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${url}`}
                download={`${name}-qr.png`}
              >
                Download
              </a>
            </Button>
          </div>
          <div className="flex flex-col items-center">
            <Avatar className="h-32 w-32">
              {logo && <AvatarImage src={logo} alt={name} />}
              <AvatarFallback className="text-3xl">{name[0]}</AvatarFallback>
            </Avatar>
            <p className="font-bold">{name}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
