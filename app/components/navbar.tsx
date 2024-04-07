import siteConfig from "~/site.config";
import { Button } from "~/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";
import { Form, Link } from "@remix-run/react";
import { ReactNode } from "react";

interface NavbarProps {
  isLoggedIn: boolean;
  path: string;
}

export default function Navbar({ isLoggedIn, path }: NavbarProps) {
  const {
    to,
    text,
    showSecondaryNavbar = false,
  } = siteConfig.navLinks[path in siteConfig.navLinks ? path : "/"];

  return (
    <nav>
      <div className="flex justify-between items-center h-20">
        <Link to="/" className="text-3xl font-bold text-primary">
          TEC
        </Link>
        <div className="flex gap-3">
          {isLoggedIn ? (
            <Button className="font-semibold text-base" asChild>
              <Link to={to}>{text}</Link>
            </Button>
          ) : (
            <Button className="font-semibold text-base" asChild>
              <Link to="/sign-in">Sign In</Link>
            </Button>
          )}
          {isLoggedIn && (
            <Form method="POST" action="/sign-out">
              <Button type="submit" className="font-semibold text-base">
                Sign Out
              </Button>
            </Form>
          )}
        </div>
      </div>
      {showSecondaryNavbar && <SecondaryNavbar />}
    </nav>
  );
}

function SecondaryNavbar() {
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
