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

El orden de la página es: Intro, AWS Architect, Certifications, AI Red Teaming,
AI Security Write-ups, Experience/Education y Contact, seguido del pie. Experience
y Education comparten un bloque editorial de dos columnas iguales, con encabezados
alineados y un divisor central, también a 768 px; por debajo de 47,5 rem se apilan
y el divisor pasa a ser horizontal. Experience muestra periodos profesionales.
Education conserva el orden solicitado y no publica fechas. Cada mecanismo combina
una rueda principal y una satélite que giran en sentidos opuestos al alcanzar el
hito; los dos ejes avanzan con scroll nativo. Todo el contenido permanece visible
sin JavaScript; con reduced-motion los ejes se muestran completos y los engranajes
no giran.

AWS Architect es un folio editorial de cinco láminas técnicas. Cada lámina expone problema,
decisión, limitación y alcance técnico, con una miniatura WebP enlazada al mapa
Archify interactivo en `/architecture/`. La galería muestra tres columnas en
pantallas amplias, dos en tablet y una en móvil. No se publican nombres de
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
y casos AWS comparten catálogo en `src/lib/public-work.ts` con los hechos públicos
del chat. Todo el contenido sigue siendo legible sin JavaScript.

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

- `OLLAMA_API_KEY` es obligatoria para habilitar el chat.
- `OLLAMA_MODEL` es opcional y ya incluye el modelo predeterminado en el ejemplo.

La API acepta únicamente JSON y conversaciones de hasta ocho mensajes, con un
máximo de 2.000 caracteres por mensaje y 32 KiB por petición. Valida origen y
metadatos `Sec-Fetch-Site`, aplica un timeout de 12 segundos, limita la respuesta
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

## Comprobación

```sh
npm run build
node --test src/lib/portfolio-chat.test.ts
```

La página principal no depende de fuentes, imágenes ni scripts remotos en
runtime. Las portadas (WebP), la tarjeta social y el badge de Hack The Box viven en `public/images/`;
las portadas comparten dimensiones para conservar su alineación durante el
revelado. El chat sí depende de Ollama Cloud a través del endpoint server-only;
la clave nunca se envía al navegador.
