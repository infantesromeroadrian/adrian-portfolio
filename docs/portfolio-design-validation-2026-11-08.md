# Verificación local del portfolio — 2026-11-08

Rediseño implementado y verificado localmente sobre la base `e90175b17bc775e7c480bbd75b28333c04db459c`. Este informe recoge la validación previa a su publicación.

## Resultado

- Protected agent runtime destacado y cuatro filas con miniaturas fijas y detalles nativos.
- Página `/work/protected-agent-runtime/`: problema, decisión, límite, contexto y acceso al mapa conceptual. Doctrine Studio es una relación temática; no valida el runtime.
- Menú de cinco destinos, HTB junto a Writing y certificaciones compactas.
- Portada dual, catálogo original, credenciales, backend, mapas, dependencias y dominio conservados.

Cambios funcionales: `src/components/AwsArchitect.astro`, `MediumHighlight.astro`, `SiteNavigation.astro`, `src/lib/public-work.ts`, `src/pages/index.astro`, `src/styles/global.css` y la nueva `src/pages/work/protected-agent-runtime.astro`.

## Evidencia

- Baseline: 18/18 pruebas y build correcto.
- Candidato: 18/18 pruebas, build correcto con ambas páginas prerenderizadas, `git diff --check` limpio.
- Revisión independiente en solo lectura: sin hallazgos accionables; 18/18 pruebas, catálogo/URLs/credenciales y hechos del caso verificados. La comprobación visual y de interacción se realizó por separado.
- Navegador de pruebas Brave/Chromium: HTTP 200 en ambas rutas; capturas a 1440×900, 900×900, 768×1024, 390×844 y 320×568. Sin overflow horizontal ni imágenes rotas en las diez combinaciones.
- Menú con teclado, Escape y retorno de foco; detalles con teclado y altura de control de 44 px; tacto emulado; revelado y restauración de portada; menú y chat se cierran mutuamente. Paneles dentro del viewport mínimo.
- Sin JavaScript: cinco enlaces de navegación, cuatro detalles operables y caso accesible.
- Movimiento reducido: preferencia aplicada; nuevas secciones sin animaciones.
- Portada idéntica por comparación de píxeles a 1440 y 390, excluyendo controles flotantes. Misma altura y fuente/JS de portada intactos.
- Catálogo previo idéntico por comparación profunda; campos presentes en el DOM; cuatro filas más destacado; IDs anteriores conservados, sin duplicados.
- Enlaces internos: 12 destinos únicos desde inicio y 8 desde caso; cero fallos de ruta o fragmento. Enlaces externos conservados; no se afirma una auditoría de sus servicios remotos.
- Consola: 0 errores y 0 avisos en la sesión de pruebas.
- Chat: interfaz y regresiones del contrato compartido comprobadas; sin conversación real con proveedor ni evaluación ofensiva.

## Medidas observadas

Altura en píxeles CSS; detalles cerrados en el candidato. Las filas mejoran la jerarquía; la página no resulta más corta en todos los anchos.

| Ancho | Inicio antes | Inicio después | Arquitecturas antes | Arquitecturas después |
| --- | ---: | ---: | ---: | ---: |
| 1440 | 6481 | 6742 | 2194 | 2455 |
| 900 | 6487 | 6563 | 2797 | 2738 |
| 768 | 6568 | 6537 | 2789 | 2634 |
| 390 | 9913 | 9096 | 4499 | 3737 |
| 320 | 10362 | 9425 | 4577 | 3714 |

A 390 px, arquitecturas reduce su altura un 16,9 % y el documento completo un 8,2 %. Todo el contenido anterior sigue accesible.

## Identificación y límites

Los siete archivos funcionales permanecieron sin cambios durante la revisión y la validación visual.
CSS: `215e3e6253baf0d82320c557f34103669c9b5e99269ed7e44b926e590cf26605`.
Página nueva: `a2571fbd0bdee9ae9008ff6ad874cd7e5ff8d7d611639b14e8d254fa20ba95ac`.

Esta validación local no demuestra el estado del despliegue. No se realizaron pruebas en dispositivos físicos ni en otros motores de navegador.
