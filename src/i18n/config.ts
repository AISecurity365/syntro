// Configuración i18n central de aisecurity.es
//
// Estrategia: español sin prefijo (raíz), resto de idiomas bajo su prefijo
// (/en, /fr, /nl). hreflang recíproco SOLO en páginas que existen en cada
// idioma. El "detecta-y-muestra-en-tu-idioma" lo resuelve Google con hreflang;
// nosotros nunca cambiamos el contenido de una misma URL por IP/idioma.

export const DEFAULT_LOCALE = "es" as const;
export const LOCALES = ["es", "en", "fr", "nl"] as const;
export type Locale = (typeof LOCALES)[number];

/** Prefijo de URL de cada idioma ("" = español en la raíz). */
export const LOCALE_PREFIX: Record<Locale, string> = {
  es: "",
  en: "/en",
  fr: "/fr",
  nl: "/nl",
};

/** Etiqueta de cada idioma en su propio idioma (para el selector). */
export const LOCALE_LABEL: Record<Locale, string> = {
  es: "Español",
  en: "English",
  fr: "Français",
  nl: "Nederlands",
};

/**
 * Para cada ruta canónica (español, con barra inicial), los idiomas ADICIONALES
 * (además de "es") en los que EXISTE una traducción publicada. Se rellena a
 * medida que se crean los archivos: así el hreflang y el selector de idioma
 * nunca apuntan a un 404. Si una ruta no está aquí, se trata como monoidioma.
 *
 * El homepage de cada idioma es "/" (sirve la raíz de ese prefijo).
 */
export const TRANSLATIONS: Record<string, Locale[]> = {
  "/wazuh": ["en", "fr", "nl"],
  "/blog": ["en", "fr", "nl"],
  // Embudo de conversión
  "/reunion": ["en"],
  "/presupuesto": ["en"],
  // Clúster Wazuh del blog (mismo slug bajo cada prefijo)
  "/blog/que-es-wazuh-para-que-sirve": ["en", "fr", "nl"],
  "/blog/como-instalar-wazuh-en-linux": ["en", "fr", "nl"],
  "/blog/como-instalar-wazuh-con-docker": ["en", "fr", "nl"],
  "/blog/como-instalar-agente-wazuh-en-windows": ["en", "fr", "nl"],
  "/blog/como-instalar-agente-wazuh-en-linux": ["en", "fr", "nl"],
  "/blog/configuracion-de-grupos-en-wazuh": ["en", "fr", "nl"],
  "/blog/configurar-equipos-sin-agente-wazuh-syslog": ["en", "fr", "nl"],
  "/blog/flujo-logs-wazuh-decoders-reglas-alertas": ["en"],
  "/blog/crear-reglas-personalizadas-wazuh": ["en"],
  "/blog/configurar-alertas-correo-wazuh-postfix-gmail": ["en"],
  "/blog/detectar-instalaciones-software-windows-wazuh": ["en"],
  "/blog/monitorizar-certificados-wazuh-fim": ["en"],
  "/blog/integracion-wazuh-virustotal": ["en"],
  "/blog/panel-vulnerability-detection-wazuh": ["en"],
  "/blog/investigar-ataque-ssh-wazuh-discover": ["en"],
  "/blog/monitorizacion-de-contenedores-docker-con-wazuh": ["en"],
  "/blog/wazuh-elastic-security-configuracion-de-siem-completo": ["en"],
  "/blog/como-monitorizar-tu-tenant-de-office365-registros-de-exchange-sharepoint": ["en"],
  "/blog/wazuh-mcp-server-claude-ia": ["en"],
  "/blog/ia-threat-hunting-wazuh": ["en"],
};

/** Detecta el locale a partir del pathname (/fr o /fr/... => fr). */
export function getLocaleFromPath(pathname: string): Locale {
  for (const loc of LOCALES) {
    if (loc === "es") continue;
    const prefix = LOCALE_PREFIX[loc];
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return loc;
  }
  return "es";
}

/** Quita el prefijo de idioma y devuelve la ruta canónica española (con barra inicial). */
export function stripLocale(pathname: string): string {
  const loc = getLocaleFromPath(pathname);
  if (loc === "es") return pathname;
  const rest = pathname.slice(LOCALE_PREFIX[loc].length); // "/fr/wazuh" -> "/wazuh"
  return rest === "" ? "/" : rest;
}

/** Construye la URL de una ruta canónica en un locale concreto. */
export function localizePath(canonicalPath: string, locale: Locale): string {
  const prefix = LOCALE_PREFIX[locale];
  if (canonicalPath === "/") return prefix === "" ? "/" : prefix;
  return `${prefix}${canonicalPath}`;
}

/** Idiomas en los que existe esta ruta canónica (siempre incluye "es"). */
export function localesFor(canonicalPath: string): Locale[] {
  return ["es", ...(TRANSLATIONS[canonicalPath] ?? [])];
}

/** ¿Esta ruta canónica tiene versión en más de un idioma? */
export function hasTranslation(canonicalPath: string): boolean {
  return (TRANSLATIONS[canonicalPath]?.length ?? 0) > 0;
}