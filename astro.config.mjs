// @ts-check
import { defineConfig } from 'astro/config';
import netlify from "@astrojs/netlify";
import sitemap from "@astrojs/sitemap";

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: "https://proplumb.com.au",
  adapter: netlify(),
  integrations: [sitemap()],
  redirects: {
    "/services/civil-&-drainage": {
      status: 301,
      destination: "/services/civil-drainage",
    },
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
