import { Form, Link, useLocation } from "@remix-run/react";
import {
  BadgeCheck,
  Building,
  Calendar,
  CircleHelp,
  CirclePlus,
  Home,
  LogOut,
  Menu,
  Pencil,
  StickyNote,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "~/utils/helpers";

interface SidebarProps {
  isAdmin?: boolean;
}

export default function Sidebar({ isAdmin = false }: SidebarProps) {
  const { pathname } = useLocation();
  const [showSidebar, setShowSidebar] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        showSidebar &&
        sidebarRef.current &&
        !sidebarRef.current?.contains(event.target as Node)
      ) {
        setShowSidebar(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [showSidebar]);

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
        {
          to: "/admin/events",
          text: "Events",
          icon: <Calendar size={22} />,
        },
        {
          to: "/admin/blog",
          text: "Blog",
          icon: <StickyNote size={22} />,
        },
      ]
    : [
        { to: "/dashboard", text: "Dashboard", icon: <Home size={22} /> },
        {
          to: "/dashboard/enquires",
          text: "Enquires",
          icon: <CircleHelp size={22} />,
        },
        { to: "/dashboard/edit", text: "Edit", icon: <Pencil size={22} /> },
      ];

  return (
    <>
      <Menu
        onClick={() => setShowSidebar((prev) => !prev)}
        className="m-5 sm:hidden"
      />
      <aside
        ref={sidebarRef}
        className={cn(
          "duration-30 fixed -left-24 z-10 flex h-screen w-14 flex-col items-center justify-between gap-5 border bg-secondary pb-10 pt-4 transition-all sm:left-0",
          showSidebar && "left-0",
        )}
      >
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
    </>
  );
}
