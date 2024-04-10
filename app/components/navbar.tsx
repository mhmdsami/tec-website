import { BusinessType } from "@prisma-app/client";
import { Form, Link } from "@remix-run/react";
import { LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";
import { cn } from "~/lib/utils";

interface NavbarProps {
  isLoggedIn: boolean;
  businessTypes: BusinessType[];
}

export default function Navbar({ isLoggedIn, businessTypes }: NavbarProps) {
  const links: Array<
    | {
        hasSubLinks: true;
        text: string;
        subLinks: Array<{ text: string; to: string }>;
      }
    | { hasSubLinks: false; text: string; to: string }
  > = [
    { hasSubLinks: false, text: "Home", to: "/" },
    { hasSubLinks: false, text: "About Us", to: "/about" },
    {
      hasSubLinks: true,
      text: "Members",
      subLinks: businessTypes.map(({ name, slug }) => {
        return { text: name, to: `/members/${slug}` };
      }),
    },
    { hasSubLinks: false, text: "Events", to: "/events" },
    { hasSubLinks: false, text: "Blog", to: "/blog" },
    { hasSubLinks: false, text: "Contact Us", to: "/contact" },
  ];

  return (
    <nav className="flex h-20 items-center justify-between">
      <Link to="/" className="text-3xl font-bold text-primary">
        TEC
      </Link>
      <div className="flex gap-3">
        <NavigationMenu>
          <NavigationMenuList>
            {links.map((element) =>
              element.hasSubLinks ? (
                <NavigationMenuItem key={element.text}>
                  <NavigationMenuTrigger>{element.text}</NavigationMenuTrigger>
                  <NavigationMenuContent className="p-2">
                    {element.subLinks.slice(0, 5).map((link) => (
                      <NavbarLink to={link.to} className="w-full justify-start">
                        {link.text}
                      </NavbarLink>
                    ))}
                    <NavbarLink to="/members" className="w-full justify-start">
                      More
                    </NavbarLink>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem key={element.text}>
                  <NavbarLink to={element.to}>{element.text}</NavbarLink>
                </NavigationMenuItem>
              ),
            )}
          </NavigationMenuList>
        </NavigationMenu>
        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="ml-1 rounded-full bg-black p-2.5">
              <UserRound className="text-white" size={20} strokeWidth={3} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-10">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link to="/dashboard">
                <DropdownMenuItem className="hover:cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" />{" "}
                  <span>Dashboard</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <Form method="POST" action="/sign-out">
                  <button type="submit">Sign Out</button>
                </Form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild className="text-base font-semibold">
            <Link to="/sign-in">Sign In</Link>
          </Button>
        )}
      </div>
    </nav>
  );
}

interface NavbarLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
}

const NavbarLink = ({ to, children, className }: NavbarLinkProps) => (
  <Link to={to}>
    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), className)}>
      {children}
    </NavigationMenuLink>
  </Link>
);
