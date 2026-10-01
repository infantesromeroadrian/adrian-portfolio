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

Cada mecanismo combina una rueda principal y una satélite que giran en sentidos
opuestos al alcanzar el hito. Los dos ejes avanzan de manera independiente con
scroll nativo. Todo el contenido permanece visible sin JavaScript; con
reduced-motion los ejes se muestran completos y los engranajes no giran.

Certifications aparece a continuación con tres credenciales completadas en una
retícula editorial: tres columnas en escritorio y tablet, y una en móvil
estrecho. El contenido es estático y no publica fechas ni enlaces.

El bloque Hack The Box continúa con el alias L4tentNoise, el titular Global Top 100
y un enlace al perfil que abre en una pestaña nueva. Usa HTML estático y conserva
el foco visible del sitio.

Debajo de la portada de la intro aparece una pieza editorial compacta de Medium
con acceso directo a `@infantesromeroadrian`. El enlace abre el perfil en una
pestaña nueva y el contenido sigue siendo legible sin JavaScript.

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

El endpoint no incorpora rate limiting distribuido. Los límites anteriores
acotan cada petición, pero un despliegue público necesitará una protección
compartida en el borde si aparece abuso sostenido entre varias instancias.

## Comprobación

```sh
npm run build
```

La página principal no depende de fuentes, imágenes ni scripts remotos en
runtime. Las dos portadas viven en `public/images/` con las mismas dimensiones
para conservar su alineación durante el revelado. El chat sí depende de Ollama
Cloud a través del endpoint server-only; la clave nunca se envía al navegador.
