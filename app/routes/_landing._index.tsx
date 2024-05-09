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
  return (
    <div className="flex">
      <div className="flex h-[80vh] flex-col-reverse items-center justify-center sm:flex-row">
        <div className="sm:basis-1/2">
          <h1 className="text-4xl font-bold lg:text-7xl">
            Tirunelveli Economic Chamber
          </h1>
          <p className="text-sm text-muted-foreground">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
            porta imperdiet turpis nonvarius. Nam et neque lobortis, eleifend
            libero non, finibus magna.
          </p>
        </div>
        <div className="sm:basis-1/2">
          <img src="/tec.png" alt="TEC Logo" />
        </div>
      </div>
    </div>
  );
}
