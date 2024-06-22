import { Business, Service } from "@prisma-app/client";
import Autoplay from "embla-carousel-autoplay";
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import siteConfig from "~/site.config";
import { cn } from "~/utils/helpers";
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
    <Card className="w-screen overflow-hidden md:w-[1000px]">
      <img
        src={coverImage || ""}
        alt={name}
        className="aspect-video rounded-t-lg object-cover"
      />
      <CardHeader className="flex flex-row justify-between">
        <div className="flex flex-col gap-2">
          <Avatar className="-mt-20 h-32 w-32 self-start lg:-mt-44 lg:h-80 lg:w-80">
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
        {services && services.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xl font-bold">Services</p>
            <Carousel
              plugins={[
                Autoplay({
                  delay: 3000,
                }),
              ]}
            >
              <CarouselContent>
                {services.map(({ title, description, image }, idx) => (
                  <CarouselItem
                    key={idx}
                    className={cn(services.length > 1 && "basis-1/2")}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl">{title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-2">
                        {image && (
                          <img
                            src={image}
                            alt={title}
                            className="aspect-video object-contain"
                          />
                        )}
                        <p>{description}</p>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {services.length > 2 && (
                <div className="mt-5 flex items-center justify-center gap-3">
                  <CarouselPrevious className="static translate-y-0" />
                  <CarouselNext className="static translate-y-0" />
                </div>
              )}
            </Carousel>
          </div>
        )}
        <div>
          <iframe
            src={`https://maps.google.com/maps?q=${location}/&output=embed`}
            style={{ border: 0 }}
            width="100%"
            height="400"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
        <CopiableInput value={url} />
        <div className="flex items-center justify-around gap-2 rounded-lg bg-secondary p-5">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${url}`}
            alt="qrcode"
            className="h-20 w-20 rounded-s md:h-32 md:w-32"
          />
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-20 w-20 md:h-32 md:w-32">
              {logo && <AvatarImage src={logo} alt={name} />}
              <AvatarFallback className="text-3xl">{name[0]}</AvatarFallback>
            </Avatar>
            <p className="text-xs font-bold">{name}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
