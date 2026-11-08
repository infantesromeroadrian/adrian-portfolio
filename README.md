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

El orden de la página es: Intro, trabajo profesional y estudios conceptuales,
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
simplificada; no son topologías literales de producción.

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

AI Security Write-ups presenta cuatro análisis de retos HTB con enlaces directos a
Medium y una conclusión defensiva por artículo; Sigma Technology conserva el
alcance de reproducción parcial. Contact cierra la página con un enlace principal a
LinkedIn, los perfiles públicos (Medium, LinkedIn, GitHub, X y Hack The Box) y una
nota sobre la seguridad del asistente; no publica correo electrónico. Los artículos
y estudios conceptuales comparten catálogo en `src/lib/public-work.ts` con los
hechos públicos del chat. Los nuevos relatos profesionales tienen un catálogo
separado y no amplían automáticamente el contexto del asistente. Todo el contenido sigue siendo legible sin JavaScript.

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
- `OLLAMA_MODEL` es opcional y ya incluye el modelo predeterminado en el ejemplo.
- `CHAT_ENABLED` es el interruptor de apagado: con `false` (también `0`, `off`, `no`)
  `GET /api/chat` responde `{"available":false}` y `POST` devuelve 503 sin llamar al
  proveedor. Cámbiala en Vercel y redespliega; no requiere cambios de código.

La API acepta únicamente JSON y conversaciones de hasta ocho mensajes, con un
máximo de 2.000 caracteres por mensaje y 32 KiB por petición. Un `POST` debe llevar un
`Origin` idéntico al del sitio o, si el navegador lo omite, `Sec-Fetch-Site: same-origin`;
en otro caso responde 403. Esto frena el uso desde otros sitios, no a un script, que
puede enviar esas cabeceras: por eso existen los límites de frecuencia y el interruptor.
Aplica aplica un timeout de 12 segundos, limita la respuesta
del proveedor a 64 KiB y entrega como máximo 4.000 caracteres. Las respuestas no
se almacenan en caché y los errores públicos no incluyen datos del proveedor.

Cada cliente (una IPv4 o una red IPv6 /64) puede enviar 5 mensajes por minuto y 30
al día, y cada instancia del servidor acepta como máximo 300 al día. Al superar un
límite, la API responde `429 RATE_LIMITED` con `Retry-After` antes de leer el cuerpo
o llamar al proveedor. La IP procede de `X-Forwarded-For`, que Vercel sobrescribe en
su edge para impedir que el cliente la falsifique
([request headers](https://vercel.com/docs/headers/request-headers#x-forwarded-for)).

Los contadores viven en la memoria de cada instancia: frenan un bucle de un mismo
origen, pero no son un límite global entre instancias concurrentes. Para un tope
estricto, añade una regla de WAF Rate Limiting sobre `POST /api/chat`, disponible en
todos los planes con una regla por proyecto en Hobby
([WAF Rate Limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting)),
o un almacén compartido.

### Clave dedicada y despliegue (pasos manuales)

1. En Ollama, crea una clave exclusiva para el portfolio (nombre sugerido
   `portfolio-chat`), distinta de las que usan otros servicios, para poder revocarla
   sin afectar a nada más. Nunca la pegues en el chat ni en el repositorio.
2. En Vercel → Project → Settings → Environment Variables, define `OLLAMA_API_KEY`
   (marcada como Sensitive) y `CHAT_ENABLED=true` en Production y Preview.
3. En Vercel → Firewall → Configure → Custom Rules, crea una regla de **Rate Limit**
   con estos valores exactos:
   - Condiciones: `Request Method` es `POST` **y** `Request Path` es igual a `/api/chat`.
   - Clave de límite: IP.
   - Umbral y ventana: 10 peticiones por 60 segundos (el código ya aplica 5 por minuto
     por IP; la regla es la red de seguridad del edge, no sustituye al código).
   - Acción: Deny (429).
   - Publica la regla («Review Changes» → «Publish») y comprueba en el panel de
     Firewall que aparece activa.
   Limitación: el tope diario de 300 mensajes del código es **por instancia**, no
   global. Con varias instancias concurrentes el total diario puede superarlo; el
   límite global real es la regla WAF por ventana, el interruptor `CHAT_ENABLED` y la
   cuota de la clave dedicada.
4. Para cortar el chat de inmediato: `CHAT_ENABLED=false` y redespliegue, o revoca la
   clave en Ollama.

### Defensas del asistente

El prompt de sistema no es una frontera de seguridad. Además de sus reglas
(`ASSISTANT_RULES`), `src/lib/chat-output-guard.ts` revisa cada respuesta antes de
entregarla y la sustituye por un mensaje fijo si repite el prompt, contiene URLs o
dominios no publicados, datos de contacto, empleadores o certificaciones que no constan
en los hechos públicos, adopta otra identidad, incluye marcado activo o lenguaje
ofensivo. Los turnos `assistant` que envía el cliente pasan el mismo filtro: uno que el
servicio no pudo producir se rechaza con 400. No puede demostrar que un texto libre sea
cierto; por eso la evaluación siguiente mide lo que sí consigue un atacante.

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
