// Strings de interfaz compartidos por idioma. Cubre el banner de sugerencia de
// idioma; la navegación y el footer llevan su propio diccionario en el componente.
import type { Locale } from "./config";

export const ui = {
  es: {
    "banner.available": "Esta página está disponible en español",
    "banner.readIn": "Leer en español",
  },
  en: {
    "banner.available": "This page is available in English",
    "banner.readIn": "Read in English",
  },
  fr: {
    "banner.available": "Cette page est disponible en français",
    "banner.readIn": "Lire en français",
  },
  nl: {
    "banner.available": "Deze pagina is beschikbaar in het Nederlands",
    "banner.readIn": "Lezen in het Nederlands",
  },
} as const;

export function t(locale: Locale, key: keyof (typeof ui)["es"]): string {
  return ui[locale][key] ?? ui.es[key];
}
