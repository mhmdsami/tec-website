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
  isRouteErrorResponse,
  useLoaderData,
  useNavigate,
  useRouteError,
} from "@remix-run/react";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { Button } from "~/components/ui/button";
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
    <Layout>
      <Outlet context={{ isLoggedIn } as RootOutletContext} />
    </Layout>
  );
}

function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Tirunelveli Economic Chamber" />
        <meta
          property="og:description"
          content="The official website of Tirunelveli Economic Chamber."
        />
        <meta property="og:url" content={siteConfig.baseUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/logomark.png" />
        <link rel="icon" type="image/png" href="/logomark.png" />
        <Meta />
        <Links />
        <title>{siteConfig.name}</title>
      </head>
      <body className="flex min-h-screen flex-col">
        <Toaster
          position="top-right"
          containerClassName="mr-4"
          toastOptions={{
            style: {
              background: "hsl(var(--card))",
              color: "hsl(var(--foreground))",
              border: "1px solid hsl(var(--border))",
              maxWidth: "250px",
            },
          }}
        />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  if (isRouteErrorResponse(error)) {
    const {
      status,
      data: { message },
    } = error;

    const { message: fallbackMessage } = [
      {
        status: 404,
        message: "Page not found",
      },
      {
        status: 500,
        message: "Internal server error",
      },
    ].find((error) => error.status === status) || {
      status: message,
      message: message,
    };

    return (
      <Layout>
        <div className="flex h-screen flex-col items-center justify-center gap-3">
          <h1 className="text-6xl font-bold">{status}</h1>
          <p className="text-xl">{message ?? fallbackMessage}</p>
          <Button onClick={() => navigate(-1)}>Go back</Button>
        </div>
      </Layout>
    );
  } else if (error instanceof Error) {
    return (
      <Layout>
        <div className="flex h-screen flex-col items-center justify-center gap-3">
          <h1 className="text-6xl font-bold">Error</h1>
          <p className="text-xl">{error.message}</p>
          <Button onClick={() => navigate(-1)}>Go back</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-screen flex-col items-center justify-center gap-3">
        <h1 className="text-6xl font-bold">Error</h1>
        <p className="text-xl">
          Something went wrong! Contact admin if the error persists
        </p>
        <Button onClick={() => navigate(-1)}>Go back</Button>
      </div>
    </Layout>
  );
}
