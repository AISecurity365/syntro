import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";

export default defineConfig({
  output: "server",
  adapter: vercel(),
  site: "https://aisecurity.es",
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en", "fr", "nl"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/login') &&
        !page.includes('/signup') &&
        !page.includes('/akiwifi_old') &&
        !page.includes('/aula/') &&
        !page.includes('/index-backup') &&
        !page.includes('/test-ia') &&
        !page.includes('/index3prueba') &&
        !page.includes('/contacto-migracion') &&
        !page.includes('/soporte-pago-exitoso') &&
        !page.includes('/abrir-ticket'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    })
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
