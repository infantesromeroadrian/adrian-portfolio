# Validación local de cinco casos profesionales

Comprobado el 8 de noviembre de 2026 en el código del portfolio, los entregables Archify, el build de Astro y el navegador local. Resultado: implementación local aceptada. No acredita publicación en Vercel ni una nueva validación de sistemas corporativos.

Base Git: `7ba27e2412e4eacd28d5635ed43ab65bc7b901d3`. Candidato funcional: 21 archivos, antes de este informe y excluyendo registros locales de coordinación. SHA-256 del inventario final: `306a355a8997b10cedf24306e4c2baefd60cf506745c3cdc9338f400ec4ccc7c`.

## Resultado visible

La portada presenta un caso destacado y cuatro secundarios. Cada página contiene resumen, problema, restricciones, contribución propia y compartida, decisiones documentadas, ejemplo sintético, fecha y alcance de la evidencia, límites y mapa específico. Los estudios conceptuales anteriores se conservan como complemento con sus URLs.

| Caso | Página | Diagrama |
| --- | --- | --- |
| Recuperación segura del copiloto | `/work/safe-copilot-recovery/` | Flujo con rechazo y recuperación |
| Guardrails que conservan estado | `/work/state-preserving-guardrails/` | Secuencia de controles de entrada y salida |
| Ingesta RAG segura | `/work/secure-rag-ingestion/` | Flujo de datos, versiones y errores |
| Evaluación orientativa de LLM | `/work/advisory-llm-evaluation/` | Flujo separado de generación y evaluación |
| Capacidad y red cloud | `/work/cloud-network-capacity/` | Arquitectura de una prueba controlada |

Vista local: <http://127.0.0.1:4321/#aws-architect>. Cada mapa se sirve en `/architecture/{slug}.html`, con preview WebP y fuente JSON específica.

## Comprobaciones aceptadas

- **19/19 tests**, build de producción correcto y `git diff --check` limpio. Baseline anterior: 18/18 tests. Se añadió una comprobación del contrato del catálogo profesional.
- Los cinco HTML y cinco WebP del build en `.vercel/output/static/architecture/` coinciden byte a byte con `public/architecture/`; las cinco rutas están generadas.
- Cinco mapas validados y entregados con Archify 2.16: **9/9 checks showcase**, cero errores y cero avisos en cada uno. `visual-check` correcto en cuatro tamaños de escritorio; inspección visual real de los cinco mapas en claro y oscuro. Los recibos automáticos conservan `visualReview: pending`: la inspección visual de raíz se registra aquí, sin alterar esos recibos.
- Inicio, cinco casos nuevos y caso conceptual previo: HTTP 200, un H1, sin IDs duplicados ni desbordamiento horizontal a 1440, 768, 390 y 320 px. Quince destinos internos distintos comprobados con HTTP 200.
- Diez previews de inicio cargadas y decodificadas, también al abrir los complementos conceptuales. Navegación de casos y apertura de complementos con teclado. Cinco páginas accesibles sin JavaScript; sus enlaces a mapas permanecen disponibles.
- Visores: zoom, reset, selección por teclado, búsqueda y tema comprobados. Los cinco mapas mantienen zoom funcional a 390 y 320 px. A 320 px la barra del visor permite desplazamiento horizontal dentro de la propia barra; el documento no desborda.
- Navegación nueva sin errores de consola o de página observados. Comprobación focalizada de identificadores internos y rutas locales sin coincidencias en el nuevo contenido público. Revisión editorial de atribución y límites completada.

## Revisión independiente y corrección

Revisión CLI independiente en `readonly-review`, sandbox de solo lectura, sin MCP activos (0/66), apps, plugins ni hooks. Finalizó con salida 0. Los 21 hashes del candidato inicial coincidían antes y después de la revisión.

Un hallazgo P2: “I built and merged” atribuía personalmente la ejecución del merge, no demostrada por la evidencia. Se corrigió a una contribución propia implementada y un estado integrado por separado. También se aclaró una referencia al caso y se separó visualmente el enlace bajo el mapa. La revisión detectó que el build previo aún no contenía los mapas; el build final y la comparación byte a byte resolvieron esa limitación.

Tras la única ronda de corrección: tests y build correctos; raíz verificó el texto generado y el figcaption a 1440, 390 y 320 px, sin desbordamiento. Solo cambiaron el catálogo profesional y el CSS respecto del candidato revisado. No quedaron defectos demostrados pendientes en este alcance.

## Entregables Archify

Los hashes corresponden a las fuentes y HTML finales, después de `deliver`. Las previews se generaron a partir de esos SVG.

| Slug | SHA-256 fuente JSON | SHA-256 HTML |
| --- | --- | --- |
| safe-copilot-recovery | `6c8c72091890d5aeca8a80f598a08650ce3b82277897d927deadb6e395ace950` | `a764247a0bcfad71516f9798a5540e992c4fe420d338ca00fd77d49f8a90b7ce` |
| state-preserving-guardrails | `c60e8f10ef6fc640b8175a7b76e9613b414005a25b6ed6b27fe133b230e65607` | `655f251157a069993c492e2d7a99a2ebcfb6be23838b9cc456aae7158cd1186c` |
| secure-rag-ingestion | `f11213d6df39c6f251d57d5b99dd8fe14ec426994f78f3ab3632115b3f5408d3` | `fbb898c536001e20a8bae0a0904a09c8f48fd5e517b26129bc0f54395fccc9d9` |
| advisory-llm-evaluation | `095697db1f91b95baad544f0554d2e295b66c09ec11d2cd3498a2a44fddc8a73` | `4417068cd17d53ac570ebffbf5dda1d57ce8250431de3f083674a0756601f478` |
| cloud-network-capacity | `baf1f158b312ea7bd621e48f05e1ed8e3b535021d93d780f45fa1c381c388212` | `7f9fa135eee0d73e2018637b806c1410e759cc365d5a4d525e93f680aac939e2` |

## Superficie y límites

Código: `src/lib/professional-work.ts`, su test, `src/pages/work/[slug].astro`, `src/components/AwsArchitect.astro`, `src/styles/global.css` y `README.md`. Diagramas: cinco JSON en `architecture/public-diagrams/`, cinco HTML y cinco WebP en `public/architecture/`. Este informe es el entregable documental adicional.

La evidencia de procedencia permanece en el registro privado; este repositorio contiene explicaciones anonimizadas. Los diagramas son simplificaciones explicativas, no topologías literales de producción ni pruebas de rendimiento. Los ejemplos son sintéticos. No se atribuyen métricas operativas, impacto comercial ni despliegues propios sin soporte.

No se modificaron dependencias, chat, hero ni sistemas corporativos. El chat conserva su catálogo previo y no se amplió para responder sobre estos casos. La QA móvil usa emulación de viewport, no dispositivos físicos.

Estado de esta validación, anterior a la publicación: **implementado y verificado localmente**. El commit, CI y despliegue posterior se verifican por separado. Propuestas de conjunto: ninguna adicional.

## Corrección posterior de la vista previa COAE

El bloque COAE solo contenía texto y un enlace de verificación; no tenía una imagen del certificado. Se incorporó una miniatura fiel del PDF original y acceso al documento completo, conservando el verificador oficial.

Cambios: `src/components/HackTheBoxHighlight.astro`, `public/images/coae-certificate-preview.webp` y `public/certificates/htb-coae-adrian-infantes.pdf`. Miniatura completa de 1400 × 990 px y 63.366 bytes. PDF de 125.103 bytes, con SHA-256 `f6f12847f6311aa132f0b8242efe70f4da8e7bae819d9ec46696d9e4dbda1680`; original, copia pública, respuesta HTTP y artefacto construido coinciden byte a byte.

Build correcto; imagen cargada y sin desbordamiento a 1440, 768, 390 y 320 px. Inspección visual de escritorio y móvil, apertura del PDF con Enter y funcionamiento sin JavaScript comprobados. Imagen y documento responden HTTP 200 con MIME correcto. Los 21 archivos del candidato profesional anterior conservan sus hashes; el ajuste COAE añade tres archivos al candidato funcional sin modificar aquellos.
