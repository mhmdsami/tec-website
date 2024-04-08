import type { MetaFunction } from "@remix-run/node";
import siteConfig from "~/site.config";

export const meta: MetaFunction = () => {
  return [
    { title: siteConfig.name },
    {
      name: "description",
      content: siteConfig.description,
    },
  ];
};

export default function Index() {
  return <div />;
}
