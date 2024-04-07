type SiteConfig = {
  name: string;
  description: string;
  navLinks: {
    [key: string]: {
      text: string;
      to: string;
      showSecondaryNavbar?: boolean;
    };
  };
  sessionName: string;
};

const siteConfig = {
  name: "Tirunelveli Economic Chamber",
  description: "The official website of Tirunelveli Economic Chamber.",
  navLinks: {
    "/": {
      text: "Dashboard",
      to: "/dashboard",
      showSecondaryNavbar: true,
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

export default siteConfig as SiteConfig;
