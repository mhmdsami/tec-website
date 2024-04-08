type SiteConfig = {
  name: string;
  description: string;
  navLinks: {
    [key: string]: {
      text: string;
      to: string;
    };
  };
  sessionName: string;
};

const siteConfig: SiteConfig = {
  name: "Tirunelveli Economic Chamber",
  description: "The official website of Tirunelveli Economic Chamber.",
  navLinks: {
    "/": {
      text: "Dashboard",
      to: "/dashboard",
    },
    "/dashboard": {
      text: "Home",
      to: "/",
    },
    "/sign-in": {
      text: "Sign Up",
      to: "/sign-up",
    },
    "/sign-up": {
      text: "Sign In",
      to: "/sign-in",
    },
  },
  sessionName: "__remix_template_session",
};

export default siteConfig;
