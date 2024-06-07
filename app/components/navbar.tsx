import { Form, Link } from "@remix-run/react";
import { LayoutDashboard, LogOut, Menu, UserRound } from "lucide-react";
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
import { cn } from "~/utils/helpers";

interface NavbarProps {
  isLoggedIn: boolean;
}

type Links = Array<{ text: string; to: string }>;

export default function Navbar({ isLoggedIn }: NavbarProps) {
  const desktopLinks: Links = [
    { text: "Home", to: "/" },
    { text: "About Us", to: "/about" },
    {
      text: "Members",
      to: "/members",
    },
    { text: "Events", to: "/events" },
    { text: "Blog", to: "/blogs" },
    { text: "Contact Us", to: "/contact" },
  ];

  const mobileLinks: Links = [
    { text: "Home", to: "/" },
    { text: "About Us", to: "/about" },
    { text: "Members", to: "/members" },
    { text: "Events", to: "/events" },
    { text: "Blog", to: "/blogs" },
    { text: "Contact Us", to: "/contact" },
  ];

  !isLoggedIn && mobileLinks.push({ text: "Sign In", to: "/sign-in" });

  return (
    <nav className="flex h-20 items-center justify-between">
      <Link
        to="/"
        className="text-3xl font-bold text-primary"
        prefetch="viewport"
      >
        <img src="/logomark.png" alt="TEC Logo" className="h-12 w-12" />
      </Link>
      <div className="flex flex-row-reverse gap-3 md:flex-row">
        <NavigationMenu>
          <NavigationMenu className="list-none md:hidden">
            <NavigationMenuItem>
              <NavigationMenuTrigger showChevron={false}>
                <Menu />
              </NavigationMenuTrigger>
              <NavigationMenuContent className="p-2">
                <NavbarItems links={mobileLinks} />
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenu>
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavbarItems links={desktopLinks} />
            </NavigationMenuList>
          </NavigationMenu>
        </NavigationMenu>
        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="ml-1 rounded-full bg-black p-2.5">
              <UserRound className="text-white" size={20} strokeWidth={3} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-10">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link to="/dashboard" prefetch="render">
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
          <Button asChild className="hidden text-base font-semibold md:block">
            <Link to="/sign-in" prefetch="render">
              Sign In
            </Link>
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
  <Link to={to} prefetch="intent">
    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), className)}>
      {children}
    </NavigationMenuLink>
  </Link>
);

interface NavbarItemsProps {
  links: Links;
}

function NavbarItems({ links }: NavbarItemsProps) {
  return (
    <>
      {links.map((element) => (
        <NavigationMenuItem key={element.text}>
          <NavbarLink to={element.to}>{element.text}</NavbarLink>
        </NavigationMenuItem>
      ))}
    </>
  );
}
