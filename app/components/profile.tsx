import { Business, Service } from "@prisma-app/client";
import {
  Facebook,
  Instagram,
  Linkedin,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { ReactNode } from "react";
import { CopiableInput } from "~/components/copiable-input";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
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
  services?: Array<Omit<Service, "createdAt"> & { createdAt: string }>;
}

export default function Profile({
  id,
  name,
  tagline,
  about,
  logo,
  location,
  instagram,
  whatsApp,
  facebook,
  linkedIn,
  phone,
  children,
  coverImage,
  headerChildren,
  services,
}: ProfileProps) {
  const url = `${siteConfig.baseUrl}/business/${id}`;

  return (
    <Card className="w-screen md:w-[500px]">
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
        <div className="flex flex-col gap-2">
          <p className="text-xl font-bold">About</p>
          <p>{about}</p>
        </div>
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
          <MapPin />
          <p>{location}</p>
        </div>
        <div className="flex gap-2">
          {instagram && (
            <a href={instagram}>
              <Instagram />
            </a>
          )}
          {whatsApp && (
            <a href={`https://wa.me/${whatsApp}`}>
              <MessageCircle />
            </a>
          )}
          {facebook && (
            <a href={facebook}>
              <Facebook />
            </a>
          )}
          {linkedIn && (
            <a href={linkedIn}>
              <Linkedin />
            </a>
          )}
        </div>
        {children}
        {services && (
          <div className="flex flex-col gap-2">
            <p className="text-xl font-bold">Services</p>
            <div className="flex flex-col gap-4">
              {services.map(({ title, description, image }, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-xl">{title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <p>{description}</p>
                    {image && (
                      <img src={image} alt={title} className="rounded-lg" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        <CopiableInput value={url} />
        <div className="flex items-center justify-around gap-2 rounded-lg bg-secondary p-5">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${url}`}
            alt="qrcode"
            className="h-24 w-24 rounded-s md:h-40 md:w-40"
          />
          <div className="flex flex-col items-center">
            <Avatar className="h-20 w-20 md:h-32 md:w-32">
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
