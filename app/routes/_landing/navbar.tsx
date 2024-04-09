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
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";

interface NavbarProps {
  isLoggedIn: boolean;
}

export default function Navbar({ isLoggedIn }: NavbarProps) {
  const links = [
    { to: "/", text: "Home" },
    { to: "/about", text: "About Us" },
    { to: "/members", text: "Members" },
    { to: "/events", text: "Events" },
    { to: "/blog", text: "Blog" },
    { to: "/contact", text: "Contact Us" },
  ];

  return (
    <nav className="flex h-20 items-center justify-between">
      <Link to="/" className="text-3xl font-bold text-primary">
        TEC
      </Link>
      <div className="flex gap-3">
        <NavigationMenu className="md:-mx-3">
          <NavigationMenuList>
            {links.map(({ to, text }) => (
              <NavigationMenuItem key={to}>
                <NavbarLink to={to}>{text}</NavbarLink>
              </NavigationMenuItem>
            ))}
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
}

const NavbarLink = ({ to, children }: NavbarLinkProps) => (
  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
    <Link to={to} className="text-lg">
      {children}
    </Link>
  </NavigationMenuLink>
);
