import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import { Toaster } from "react-hot-toast";
import Navbar from "~/components/navbar";
import siteConfig from "~/site.config";
import styles from "~/styles/globals.css?url";
import { getUserId } from "~/utils/session.server";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

type LoaderData = {
  isLoggedIn: boolean;
};

export const loader: LoaderFunction = async ({ request }) => {
  const isLoggedIn = !!(await getUserId(request));

  return json({ isLoggedIn });
};

export default function App() {
  const { isLoggedIn } = useLoaderData<LoaderData>();
  const { pathname } = useLocation();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <title>{siteConfig.name}</title>
      </head>
      <body className="mx-10 flex min-h-screen flex-col">
        <Toaster
          position="top-right"
          containerClassName="mt-[10vh] mr-4"
          toastOptions={{
            style: {
              background: "hsl(var(--card))",
              color: "hsl(var(--foreground))",
              border: "1px solid hsl(var(--border))",
              maxWidth: "250px",
            },
          }}
        />
        <Navbar isLoggedIn={isLoggedIn} path={pathname} />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
