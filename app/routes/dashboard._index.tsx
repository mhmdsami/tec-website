import { Link, useOutletContext } from "@remix-run/react";
import { Instagram, MessageCircle, Phone } from "lucide-react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { DashboardOutletContext } from "~/routes/dashboard";

export default function Dashboard() {
  const {
    business: { name, tagline, about, instagram, phone, whatsApp },
  } = useOutletContext<DashboardOutletContext>();

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center overflow-scroll">
      <Card className="w-[500px]">
        <CardHeader className="items-center">
          <Avatar className="-mt-20 h-40 w-40">
            <AvatarFallback className="text-3xl">{name[0]}</AvatarFallback>
          </Avatar>
          <CardTitle className="">{name}</CardTitle>
          <CardDescription>{tagline}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button>
            <Link to="/dashboard/edit">Edit</Link>
          </Button>
          <div>
            <p className="text-lg font-bold">About</p>
            <p>{about}</p>
          </div>
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
    </div>
  );
}
