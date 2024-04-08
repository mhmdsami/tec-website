import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";
import { ReactNode } from "react";
import { Link } from "@remix-run/react";

export default function SecondaryNavbar() {
  const links = [
    { to: "/", text: "Home" },
    { to: "/about", text: "About Us" },
    { to: "/members", text: "Members" },
    { to: "/events", text: "Events" },
    { to: "/blog", text: "Blog" },
    { to: "/contact", text: "Contact Us" },
  ];

  return (
    <NavigationMenu className="md:-mx-3">
      <NavigationMenuList>
        {links.map(({ to, text }) => (
          <NavigationMenuItem key={to}>
            <NavbarLink to={to}>{text}</NavbarLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
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
