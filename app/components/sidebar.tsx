import { Form, Link, useLocation } from "@remix-run/react";
import {
  BadgeCheck,
  Building,
  CircleHelp,
  CirclePlus,
  Home,
  LogOut,
  Pencil,
} from "lucide-react";
import { cn } from "~/lib/utils";

interface SidebarProps {
  isAdmin?: boolean;
}

export default function Sidebar({ isAdmin = false }: SidebarProps) {
  const { pathname } = useLocation();

  const links = isAdmin
    ? [
        { to: "/admin", text: "Admin", icon: <Home size={22} /> },
        {
          to: "/admin/businesses",
          text: "Businesses",
          icon: <Building size={22} />,
        },
        {
          to: "/admin/verification",
          text: "Verify",
          icon: <BadgeCheck size={22} />,
        },
        {
          to: "/admin/manage/type",
          text: "Add Business Type",
          icon: <CirclePlus size={22} />,
        },
      ]
    : [
        { to: "/dashboard", text: "Dashboard", icon: <Home size={22} /> },
        {
          to: "/dashboard/enquries",
          text: "Enquries",
          icon: <CircleHelp size={22} />,
        },
        { to: "/dashboard/edit", text: "Edit", icon: <Pencil size={22} /> },
      ];

  return (
    <aside className="fixed flex h-screen w-14 flex-col items-center justify-between gap-5 border bg-secondary pb-10 pt-4">
      <div className="flex flex-col items-center gap-5">
        <Link to="/" className="font-bold text-primary">
          TEC
        </Link>
        <div className="flex flex-col items-center gap-2">
          {links.map(({ to, text, icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "rounded-xl p-2",
                pathname === to && "bg-primary/10",
              )}
            >
              {icon}
            </Link>
          ))}
        </div>
      </div>
      <Form method="POST" action="/sign-out" className="hover:cursor-pointer">
        <button type="submit">
          <LogOut size={22} />
        </button>
      </Form>
    </aside>
  );
}
