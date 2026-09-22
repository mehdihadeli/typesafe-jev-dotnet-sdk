import { defineConfig } from "vitepress";

export default defineConfig({
  title: "TypeSafe Jev .NET SDK",
  description: "Typed .NET access to TypeSafe Jev decisions",
  base: process.env.GITHUB_ACTIONS
    ? `/${process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "typesafe-jev-dotnet-sdk"}/`
    : "/",
  cleanUrls: true,
  appearance: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/quickstart" },
      { text: "Architecture", link: "/guide/architecture" },
      { text: "API reference", link: "/reference/api" },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "Start here",
          items: [
            { text: "Quickstart", link: "/guide/quickstart" },
            { text: "Architecture", link: "/guide/architecture" },
            { text: "Development guide", link: "/guide/development" },
            { text: "Testing workflow", link: "/guide/workflow" },
            { text: "Versioning", link: "/guide/versioning" },
          ],
        },
        {
          text: "Reference",
          items: [{ text: "API reference", link: "/reference/api" }],
        },
      ],
      "/reference/": [
        {
          text: "Reference",
          items: [{ text: "API reference", link: "/reference/api" }],
        },
      ],
    },
    outline: "deep",
    outlineTitle: "On this page",
    sidebarMenuLabel: "Menu",
    returnToTopLabel: "Return to top",
    darkModeSwitchLabel: "Appearance",
    lightModeSwitchTitle: "Switch to light theme",
    darkModeSwitchTitle: "Switch to dark theme",
    search: { provider: "local" },
    footer: {
      message: "Ask typed questions. Receive decisions your code can use.",
      copyright: "TypeSafe Jev .NET SDK",
    },
  },
});
