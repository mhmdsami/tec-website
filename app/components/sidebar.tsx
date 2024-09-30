import { Form, Link, useLocation } from "@remix-run/react";
import {
  BadgeCheck,
  Building,
  Calendar,
  CircleHelp,
  CirclePlus,
  Home,
  Image,
  LogOut,
  Menu,
  NotepadText,
  ReceiptText,
  StickyNote,
  UserRoundCog,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
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
        { to: "/admin", text: "Admin", Icon: Home },
        {
          to: "/admin/businesses",
          text: "Businesses",
          Icon: Building,
        },
        {
          to: "/admin/verification",
          text: "Verify Business",
          Icon: BadgeCheck,
        },
        {
          to: "/admin/manage",
          text: "Manage Business Category/Type",
          Icon: CirclePlus,
        },
        {
          to: "/admin/enquiries",
          text: "Resolve Enquiries",
          Icon: CircleHelp,
        },
        {
          to: "/admin/events",
          text: "Manage Events",
          Icon: Calendar,
        },
        {
          to: "/admin/users",
          text: "Manage Users",
          Icon: UserRoundCog,
        },
        {
          to: "/admin/blog",
          text: "Manage Blog",
          Icon: StickyNote,
        },
        {
          to: "/admin/receipt",
          text: "Generate Receipt",
          Icon: ReceiptText,
        },
        {
          to: "/admin/business-clinic",
          text: "Business Clinic",
          Icon: NotepadText,
        },
      ]
    : [
        { to: "/dashboard", text: "Dashboard", Icon: Home },
        {
          to: "/dashboard/enquires",
          text: "Enquires",
          Icon: CircleHelp,
        },
        {
          to: "/dashboard/services",
          text: "Add Service",
          Icon: CirclePlus,
        },
        {
          to: "/dashboard/gallery",
          text: "Gallery",
          Icon: Image,
        },
        {
          to: "/dashboard/business-clinic",
          text: "Business Clinic",
          Icon: NotepadText,
        },
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
          <Link to="/" className="font-bold text-primary" prefetch="render">
            <img src="/logomark.png" alt="TEC Logo" className="h-8 w-8" />
          </Link>
          <div className="flex flex-col items-center gap-2">
            {links.map(({ to, text, Icon }, idx) => (
              <TooltipProvider key={idx}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      prefetch="intent"
                      key={to}
                      to={to}
                      className={cn(
                        "rounded-xl p-2",
                        pathname === to && "bg-primary/10",
                      )}
                    >
                      <Icon size={22} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{text}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
