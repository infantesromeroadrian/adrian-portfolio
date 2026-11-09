# Adrian Portfolio

Portfolio personal en Astro. La intro divide la pantalla en un panel editorial
y dos portadas superpuestas. Una máscara circular controlada por puntero revela
la identidad de AI Red Teamer bajo la portada de AI Security Architect.

La portada abre el propio portfolio en `/`, dentro de un bloque de ancho máximo
centrado. Bajo el rol muestra una franja de pruebas con enlaces internos (Hack The
Box Global Top 10, COAE, certificaciones AWS y las cinco arquitecturas). En móvil,
el nombre y la miniportada comparten fila; la franja y About continúan debajo, y
la maquetación reserva espacio superior para que el botón fijo del menú no tape el
kicker. Las portadas se sirven en WebP (480, 800 y 1122 px) con `srcset`; la
profesional lleva `fetchpriority="high"` y la ofensiva carga con prioridad baja.

Entre la intro y Work, una banda Macintosh presenta seis especialidades con un
bucle horizontal de 40 segundos. Su botón de pausa conserva la elección mientras
el puntero o el foco detienen temporalmente el movimiento. Sin JavaScript o con
movimiento reducido, incluidas preferencias cambiadas durante la visita, muestra
la lista completa y estática. Los estilos y el control pertenecen al componente
`RetroSpecialties.astro`, sin dependencias ni recursos externos.

El orden de la página es: Intro, especialidades, trabajo profesional y estudios conceptuales,
AI Red Teaming, AI Security Write-ups, Certifications, Experience/Education y
Contact, seguido del pie. Experience
y Education comparten un bloque editorial de dos columnas iguales, con encabezados
alineados y un divisor central, también a 768 px; por debajo de 47,5 rem se apilan
y el divisor pasa a ser horizontal. Experience muestra periodos profesionales.
Education muestra ASIR (FP Superior) en The Power, el grado de UNED y los dos
programas de MIOTI, en ese orden. Ninguna entrada académica publica fechas ni
estado de finalización. Cada mecanismo combina
una rueda principal y una satélite que giran en sentidos opuestos al alcanzar el
hito; los dos ejes avanzan con scroll nativo. Todo el contenido permanece visible
sin JavaScript; con reduced-motion los ejes se muestran completos y los engranajes
no giran.

El folio de trabajo destaca un caso profesional y presenta otros cuatro en filas
con previews que enlazan a sus páginas. Los cinco relatos anonimizados se mantienen
en `src/lib/professional-work.ts` y se generan mediante la plantilla compartida
`src/pages/work/[slug].astro`. Cada caso distingue aportación propia y compartida,
decisiones, ejemplo sintético estático y evidencia revisada el 8 de noviembre de
2026 con sus límites. Los diagramas Archify explican el trabajo de forma
simplificada; no son topologías literales de producción. Las cinco páginas usan
una cabecera compacta y atajos HTML a Decisions, Architecture y Evidence junto al
resumen. Solo el caso Safe copilot recovery agrupa decisiones, ejemplo sintético y
evidencia en bloques contiguos, seguidos del mapa explicativo; los otros cuatro
conservan su secuencia. Los atajos funcionan sin JavaScript.

Entre los cinco casos profesionales y los estudios conceptuales, `#arca-harness`
enlaza el repositorio público del proyecto personal ARCA harness. La descripción
resume su README; es una referencia al proyecto, no una auditoría del exportador
ni una certificación de seguridad. No forma parte del catálogo profesional.

Los cinco estudios conceptuales originales permanecen en un bloque desplegable
nativo separado, con su contenido y URLs de mapas intactos. No representan
retroactivamente implementaciones corporativas. El caso conceptual
`/work/protected-agent-runtime/` sigue disponible. No se publican nombres de
clientes, cuentas, repositorios ni recursos.

Certifications reúne solo las dos credenciales de AWS en una retícula de dos
columnas (una en móvil estrecho). AI Red Teaming agrupa el alias L4tentNoise, el
titular Hack The Box Global Top 10, el badge enlazado al reconocimiento oficial, el
enlace al perfil y la credencial COAE con su identificador y enlace de
verificación. Todos los destinos externos abren en una pestaña nueva con foco
visible.

AI Security Write-ups presenta cuatro análisis y reproducciones de retos HTB; la
introducción indica que están publicados en Medium. Los títulos enlazan sin
flechas y solo Sigma Technology muestra la etiqueta «Partial reproduction».
Cada artículo conserva su conclusión defensiva y el alcance completo en el catálogo.
Contact cierra la página con un enlace principal a
LinkedIn, los perfiles públicos (Medium, LinkedIn, GitHub, X y Hack The Box) y una
nota sobre la seguridad del asistente; no publica correo electrónico. Los artículos
y estudios conceptuales comparten catálogo en `src/lib/public-work.ts` con los
hechos públicos del chat. Los relatos profesionales conservan su catálogo separado
en `src/lib/professional-work.ts`; el asistente deriva su contexto de ambos catálogos
mediante `chat-sources.ts`, con sus límites de evidencia. Todo el contenido del
portfolio sigue siendo legible sin JavaScript.

El botón del menú usa dos imágenes locales de Macintosh retro: arcoíris cerrado
y terminal abierto, con un encuadre CSS fijo y sin cambiar la lógica de navegación.
El menú y el chat limitan su altura al espacio visible y permiten desplazamiento
vertical. En vistas de poca altura, el chat utiliza casi toda la pantalla para
mantener accesibles el formulario y sus controles. En móvil el orbe del asistente
reduce su tamaño y el pie añade margen inferior para que no tape el final. El
panel incluye un desplegable «How this assistant is secured».

Los metadatos canonical, Open Graph y Twitter usan el dominio público y una tarjeta
social de 1200×630 (`public/images/og-card.png`); las URL de compartir son
absolutas. Hay favicon SVG e ICO y `apple-touch-icon`.

## Desarrollo local

```sh
npm install
npm run dev
```

El servidor de desarrollo usa `http://localhost:4321` por defecto.

El chat sigue este flujo: navegador → `/api/chat` → Ollama Cloud. La página se
prerenderiza como HTML estático y solo el endpoint se ejecuta bajo demanda con
el adaptador de Vercel. Configura las variables del servidor a partir de
`.env.example`:

- `OLLAMA_API_KEY` es obligatoria para habilitar el chat. Debe ser una clave
  **dedicada a este portfolio** (ver «Clave dedicada»), nunca la personal.
- `OLLAMA_MODEL` es opcional; el valor predeterminado y el ejemplo usan
  `deepseek-v4.1-flash`. La selección procede de una comparación acotada con
  Mistral Large 4 y Nemotron 3 Super realizada el 9 de noviembre de 2026 sobre
  respuestas EN/ES y JSON textual. Es evidencia de esa muestra, no una clasificación
  universal de modelos. Una variable configurada prevalece sobre el valor
  predeterminado: hay que actualizarla también en Vercel y redesplegar. La selección
  local no demuestra que la clave de producción tenga acceso al modelo: se verifica
  con una respuesta real tras el despliegue.
- `CHAT_ENABLED` es el interruptor de apagado: con `false` (también `0`, `off`, `no`)
  `GET /api/chat` responde `{"available":false}` y `POST` devuelve 503 sin llamar al
  proveedor. Cámbiala en Vercel y redespliega; no requiere cambios de código.

`GET /api/chat` comprueba que hay una clave configurada y que el servicio está
habilitado. No realiza una consulta a Ollama ni demuestra que la clave, el modelo
o la cuota permitan generar una respuesta.

La API acepta únicamente JSON y conversaciones de hasta ocho mensajes, con un
máximo de 2.000 caracteres en turnos del usuario, 4.000 en respuestas del historial
y 32 KiB por petición. `language` es opcional y solo admite `en` o `es`; si se omite,
se pide responder en el idioma del visitante. Un `POST` debe llevar un
`Origin` idéntico al del sitio o, si el navegador lo omite, `Sec-Fetch-Site: same-origin`;
en otro caso responde 403. Esto frena el uso desde otros sitios, no a un script, que
puede enviar esas cabeceras: por eso existen los límites de frecuencia y el interruptor.
La lectura del cuerpo tiene un límite de 3 segundos; la llamada al proveedor,
incluida la lectura de su respuesta, tiene otro de 12 segundos. La cancelación de la
petición se propaga al proveedor. El cuerpo del proveedor se limita a 64 KiB y el
texto entregado a 4.000 caracteres. Las respuestas no
se almacenan en caché y los errores públicos no incluyen datos del proveedor.
Ante un error HTTP del proveedor, el servidor registra únicamente el estado
numérico y una categoría controlada para distinguir autenticación, acceso, modelo
no disponible, petición rechazada, cuota o fallo del servicio. No registra cuerpos,
cabeceras, claves, identificadores de modelo, prompts ni mensajes; tampoco persiste
conversaciones. La categoría orienta el diagnóstico a partir del estado HTTP y no
demuestra por sí sola la causa concreta.

Cada cliente (una IPv4 o una red IPv6 /64) puede enviar 5 mensajes por minuto y 30
al día, y cada instancia acepta como máximo 300 al día. Además, admite una petición
pendiente por cliente y cuatro por instancia, desde antes de leer el cuerpo hasta
terminar o cancelar la respuesta. Todos los caminos liberan esa plaza en `finally`.
Una saturación temporal devuelve `429 RATE_LIMITED` con `Retry-After: 2`; los límites
de frecuencia devuelven el tiempo restante de su ventana, antes de leer el cuerpo
o llamar al proveedor. Las direcciones del adaptador se validan como IP; las
inválidas o ausentes comparten un único presupuesto conservador. No se usan cookies,
IDs ni cabeceras elegidas por el visitante como identidad alternativa. La IP procede
del contexto de Astro y de las cabeceras sobrescritas por el edge de Vercel
([request headers](https://vercel.com/docs/headers/request-headers#x-forwarded-for)).

Los contadores y plazas viven en memoria de cada instancia. No constituyen una cuota
global entre instancias, reinicios, regiones o clientes. El WAF añade un límite antes
de ejecutar la función, también con su propio alcance regional; un límite estricto
global requeriría estado compartido. La cuota del proveedor sigue siendo independiente.

### Clave dedicada y protección del edge

1. Usar una clave de Ollama exclusiva del portfolio, marcada como Sensitive en Vercel;
   no sustituir una clave existente durante un cambio de modelo ni exponerla en el
   navegador, logs o repositorio.
2. Configurar `OLLAMA_MODEL` y `CHAT_ENABLED` para el entorno y redesplegar. La
   disponibilidad de configuración no sustituye a una prueba real de generación.
3. Política WAF prevista para este endpoint: método `POST` y rutas exactas `/api/chat`
   o `/api/chat/`, clave IP, ventana fija de 10 peticiones por 60 segundos y alcance
   regional en los alias del despliegue. GET y otras páginas quedan fuera. Comprobar
   primero coincidencias con acción de registro, después publicar `rate_limit`
   (HTTP 429). La acción `deny` devuelve 403 y no equivale a rate limiting.
   [Referencia de WAF Rate Limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting).
   Estos valores documentan la política: el código no activa el WAF. Su publicación
   y estado efectivo deben verificarse por separado en la plataforma, sin confundir
   un borrador con una regla activa. La protección DDoS de Vercel no se modifica.
4. Para cortar el chat: `CHAT_ENABLED=false` y redespliegue, o revocar exclusivamente
   su clave dedicada en Ollama.

### Fuentes y respuesta del asistente

`chat-sources.ts` deriva catorce fuentes de los catálogos públicos existentes: cinco
casos profesionales, cinco estudios conceptuales y cuatro reproducciones de HTB.
El contexto conserva contribución personal y compartida, decisiones y límites de
evidencia. Los textos en primera persona pertenecen a Adrián; el asistente debe
explicarlos en tercera persona y no atribuirse su trabajo. La fecha conocida es la
revisión de evidencia de los casos profesionales, no una fecha de despliegue.

El proveedor devuelve JSON textual `{message, sourceIds}` con hasta tres IDs únicos.
Ollama Cloud no garantiza JSON Schema; se solicita el formato en el prompt, sin
`format`, y se valida en aplicación. JSON inválido, campos extra, IDs desconocidos o
una respuesta bloqueada producen el mensaje seguro sin tarjetas. El servidor resuelve
los metadatos y enlaces, devuelve `{message, sources}` y nunca utiliza URLs generadas
por el modelo para construir tarjetas. El cliente solo importa tipos y límites,
renderiza texto inerte y valida los enlaces del contrato antes de hacerlos navegables.
El historial conserva únicamente texto e IDs; sigue siendo entrada no confiable.

COAE mantiene su respuesta determinista con identificador y verificador separados,
sin llamada al proveedor. Los programas educativos no implican una titulación
obtenida. Las tarjetas distinguen experiencia profesional, conceptos y HTB; una
fuente válida no demuestra que cada afirmación del modelo esté respaldada.

### Defensas del asistente

El prompt de sistema no es una frontera de seguridad. Además de sus reglas
(`ASSISTANT_RULES`), `src/lib/chat-output-guard.ts` revisa el texto decodificado
(después de validar JSON, nunca el envoltorio JSON ni los IDs) antes de entregarlo y la sustituye por un mensaje fijo si repite el prompt, contiene URLs o
dominios no publicados, datos de contacto, empleadores o certificaciones que no constan
en los hechos públicos, adopta otra identidad, incluye marcado activo o lenguaje
ofensivo. Los turnos `assistant` que envía el cliente pasan el mismo filtro: uno que el
falla esas comprobaciones se rechaza con 400. Este filtro no autentica el historial
ni puede demostrar que un texto libre sea cierto. La evaluación histórica siguiente
es complementaria; no verifica por sí sola el contrato JSON, las tarjetas ni el
comportamiento del modelo actualmente desplegado.

### Evaluación de jailbreak e inyección

```sh
node eval/jailbreak/run.ts --backend stub --runs 3
node eval/jailbreak/run.ts --backend ollama-local --model <modelo-local> --runs 5
```

Compara el prompt anterior (`baseline`) con el flujo actual (`hardened`) sobre
`eval/jailbreak/attacks.json`. Los detectores son deterministas (marcadores sintéticos,
solapamiento con el prompt, afirmaciones falsas, expresiones regulares). El script solo
usa un Ollama local; una medición remota exige `--allow-remote` y una clave de
evaluación en `EVAL_OLLAMA_KEY`. Resultados en `eval/jailbreak/results/`.

## Comprobación

```sh
npm run build
npm test
```

La página principal no depende de fuentes, imágenes ni scripts remotos en
runtime. Las portadas (WebP), la tarjeta social y el badge de Hack The Box viven en `public/images/`;
las portadas comparten dimensiones para conservar su alineación durante el
revelado. El chat sí depende de Ollama Cloud a través del endpoint server-only;
la clave nunca se envía al navegador.
