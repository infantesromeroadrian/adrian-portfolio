# Adrian Portfolio

Portfolio personal en Astro. La intro divide la pantalla en un panel editorial
y dos portadas superpuestas. Una máscara circular controlada por puntero revela
la identidad de AI Red Teamer bajo la portada de AI Security Architect.

La portada abre el propio portfolio en `/`, dentro de un bloque de ancho máximo
centrado. En móvil, el nombre y la miniportada comparten fila; About continúa
debajo. Experience y Education continúan inmediatamente después, cada una con su
propia línea de tiempo. Ambas comparten un bloque editorial de dos columnas iguales,
con encabezados alineados y un divisor central, también a 768 px. Por debajo de
47,5 rem se apilan y el divisor pasa a ser horizontal.
Experience muestra periodos profesionales. Education conserva el orden solicitado
y no publica fechas.

AWS Architect continúa como un folio editorial de tres láminas técnicas:
guardrails como código, un runtime de agente protegido y operaciones guiadas por
evidencia. Cada caso expone su problema, decisión principal, limitación y alcance técnico, con una
miniatura WebP enlazada al mapa Archify interactivo completo en `/architecture/`.
La galería muestra tres columnas en pantallas amplias, dos en tablet y una en
móvil, evitando que los mapas ocupen la página a tamaño completo.

Cada mecanismo combina una rueda principal y una satélite que giran en sentidos
opuestos al alcanzar el hito. Los dos ejes avanzan de manera independiente con
scroll nativo. Todo el contenido permanece visible sin JavaScript; con
reduced-motion los ejes se muestran completos y los engranajes no giran.

Certifications aparece a continuación con tres credenciales completadas en una
retícula editorial: tres columnas en escritorio y tablet, y una en móvil
estrecho. COAE publica su identificador y un enlace seguro a la página de
verificación de Hack The Box; las certificaciones no publican fechas.

Awards continúa con el alias L4tentNoise, el titular Hack The Box Global Top 10,
copias locales de los badges Top 10 y Top 50 enlazadas a sus reconocimientos
oficiales y un enlace secundario al perfil. Todos los destinos abren en una pestaña
nueva y conservan el foco visible.

Después de la intro, AI Security Write-ups presenta cuatro análisis y
reproducciones de laboratorios HTB, con enlaces directos a Medium y una conclusión
defensiva por artículo. Sigma Technology conserva el alcance de reproducción
parcial. La sección mantiene los perfiles públicos de Medium, LinkedIn, GitHub y X.
Los artículos y casos AWS comparten catálogo en `src/lib/public-work.ts` con los
hechos públicos del chat. Todo el contenido sigue siendo legible sin JavaScript.

El menú y el chat limitan su altura al espacio visible y permiten desplazamiento
vertical. En vistas de poca altura, el chat utiliza casi toda la pantalla para
mantener accesibles el formulario y sus controles. Las etiquetas de redes
mantienen nombres accesibles cuando se muestran solo sus iconos.

Los metadatos canonical, Open Graph y Twitter usan el dominio público y la
portada PNG local existente; las URL de compartir son absolutas.

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
runtime. Las dos portadas y los badges de Hack The Box viven en `public/images/`;
las portadas comparten dimensiones para conservar su alineación durante el
revelado. El chat sí depende de Ollama Cloud a través del endpoint server-only;
la clave nunca se envía al navegador.
