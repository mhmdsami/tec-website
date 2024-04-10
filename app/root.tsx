import type {
  LinksFunction,
  LoaderFunction,
  TypedResponse,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { Toaster } from "react-hot-toast";
import siteConfig from "~/site.config";
import styles from "~/styles/globals.css?url";
import { getUserId } from "~/utils/session.server";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

type LoaderData = {
  isLoggedIn: boolean;
};

export const loader: LoaderFunction = async ({
  request,
}): Promise<TypedResponse<LoaderData>> => {
  const isLoggedIn = !!(await getUserId(request));

  return json({ isLoggedIn });
};

export type RootOutletContext = {
  isLoggedIn: boolean;
};

export default function App() {
  const { isLoggedIn } = useLoaderData<LoaderData>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <title>{siteConfig.name}</title>
      </head>
      <body className="flex min-h-screen flex-col">
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
        <Outlet context={{ isLoggedIn } as RootOutletContext} />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
