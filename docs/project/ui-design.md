# UI/UX y Sistema de Colores

## Problema Recurrente: Contraste

**Violación más frecuente**: texto claro sobre fondo claro, o texto oscuro sobre fondo oscuro.

**Regla simple:**
- Fondo claro (`-50` a `-200`) → texto oscuro (`base-700`, `base-800`, `base-900`)
- Fondo oscuro (`-600` a `-900`) → texto claro (`white`, `base-50`, `base-100`)

## Tailwind v4 — Colores Disponibles

Definidos en `src/styles/global.css` dentro de `@theme {}`:

- `accent-*` (25–950): Azul marca
- `base-*` (25–950): Escala de grises
- `text-black` → `#000000` (disponible desde que se añadió a `@theme`)

**Si una clase Tailwind de color no funciona** → usar `style="color: #000000;"` inline. Puede ser un problema de especificidad CSS con la regla global `p { color: var(--color-base-600); }`.

## ⚠️ Centrar `<p>` — trampa del max-width global

`src/styles/global.css` tiene `p { max-width: 70ch; }`. Esto hace que todo `<p>` tenga un ancho máximo de 70 caracteres. Sin `margin: 0 auto`, el bloque queda pegado a la izquierda aunque tenga `text-align: center` — el texto PARECE left-aligned aunque técnicamente esté centrado dentro del bloque.

**Regla:** para cualquier `<p>` que deba verse centrado (eyebrow labels, subtítulos de sección), SIEMPRE añadir las dos propiedades juntas:

```html
<!-- ✅ Correcto -->
<p style="...;text-align:center;max-width:none;">Eyebrow label</p>

<!-- ❌ Incorrecto — el bloque se queda a la izquierda -->
<p style="...;text-align:center;">Eyebrow label</p>
```

## Tabla de Combinaciones

| Fondo | Texto correcto | ❌ Nunca usar |
|-------|---------------|---------------|
| `bg-blue-50` | `text-base-800` | `text-blue-300/400/500` |
| `bg-amber-50` | `text-base-800` | `text-amber-300/400/500` |
| `bg-green-50` | `text-base-800` | `text-green-300/400/500` |
| `bg-accent-50` | `text-base-800` | `text-accent-300/400/500` |
| `bg-accent-600` | `text-white` | `text-base-700/800` |
| `bg-base-800` | `text-base-50` | `text-base-600/700` |

## Callout Boxes en Blog

Usar inline styles (las clases Tailwind de color son sobreescritas por el prose del BlogLayout):

```html
<!-- ✅ Correcto -->
<div style="background:rgba(16,185,129,0.12);border-left:4px solid #10b981;padding:1rem;margin:1.5rem 0;border-radius:0 0.5rem 0.5rem 0;">
  <p class="m-0" style="color:rgba(255,255,255,0.9);"><strong style="color:rgba(255,255,255,0.9);">Nota:</strong> Texto</p>
</div>

<!-- ❌ Incorrecto (el prose sobreescribe text-base-800) -->
<div class="bg-green-200 border-l-4 border-green-700 p-4">
  <p class="text-base-800">Texto invisible</p>
</div>
```

Colores para callouts:
- Verde: `rgba(16,185,129,0.12)` / `#10b981`
- Amber: `rgba(245,158,11,0.12)` / `#f59e0b`
- Rojo: `rgba(239,68,68,0.12)` / `#ef4444`
- Azul: `rgba(59,130,246,0.12)` / `#3b82f6`

## WCAG AA (obligatorio)

- Texto normal (<18pt): ratio mínimo **4.5:1**
- Texto grande (≥18pt o 14pt bold): ratio mínimo **3:1**

## Patrones de Diseño

- **Fondos de sección**: nunca blanco puro — usar `base-50`, `base-100` o gradientes sutiles
- **Secciones con imagen de fondo**: patrón oscuro con `opacity-15` sobre `#010303` o similar
- **Botones CTA principales**: gradiente azul con `inline-style` (Tailwind v4 tiene bugs con gradientes en botones)

## Verificación Visual

Antes de dar una tarea de UI por terminada: usar Playwright MCP para tomar screenshot y confirmar.
