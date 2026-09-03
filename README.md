# Stylo — Peluquería de autor

Landing page editorial para **Stylo**, un salón de peluquería especializado en coloración, cortes, tratamientos capilares y peinados para eventos.

El proyecto está construido como una web estática, con una estética oscura y dorada, tipografía editorial y una experiencia audiovisual basada en scroll.

## Características

- Hero inmersivo con animación controlada por el scroll.
- Secuencia de 120 imágenes WebP renderizadas en un `<canvas>`.
- Imagen fallback para mostrar el hero mientras cargan los frames.
- Secciones de servicios, reserva y contacto.
- Formularios con validación HTML y mensajes de confirmación en el cliente.
- Animaciones de entrada mediante `IntersectionObserver`.
- Diseño responsive para escritorio, tablet y móvil.
- Soporte para `prefers-reduced-motion`.
- Estados de foco visibles para navegación por teclado.
- Tipografías `Instrument Sans` y `Newsreader` cargadas desde Google Fonts.

## Estructura

```text
.
├── index.html
├── script.js
├── styles.css
└── media/
    ├── salon-hero-poster.jpg
    ├── salon-hero-poster.mp4
    ├── glassline-carriage-seamless-16x9.png
    └── frames/
        ├── frame_0001.webp
        └── ...
```

### Archivos principales

- `index.html`: estructura y contenido de la página.
- `styles.css`: sistema visual, layout, responsive y animaciones.
- `script.js`: carga de frames, animación del hero, revelado al hacer scroll y comportamiento de formularios.
- `media/frames/`: secuencia de imágenes utilizada por el hero. Los nombres deben seguir el patrón `frame_0001.webp` hasta `frame_0120.webp`.

## Ejecutar localmente

No se necesita Node.js, npm ni ninguna dependencia externa para ejecutar el proyecto.

La forma recomendada es iniciar un servidor HTTP local desde la raíz del proyecto:

```bash
python3 -m http.server 8000
```

Después, abre [http://localhost:8000](http://localhost:8000) en el navegador.

También puede abrirse `index.html` directamente, aunque un servidor local evita posibles restricciones del navegador al cargar recursos y facilita probar el comportamiento completo.

## Cómo funciona la animación del hero

`script.js` precarga los 120 frames de `media/frames/`. La posición del scroll dentro de `.hero-scroll-container` se convierte en un índice de frame. El índice mostrado se aproxima progresivamente al objetivo mediante `requestAnimationFrame`, creando una transición suave.

El canvas utiliza una resolución adaptada al `devicePixelRatio` —limitada a 2— para mantener una buena nitidez sin disparar el coste de renderizado.

## Personalización

Los contenidos principales se editan directamente en `index.html`:

- Nombre y descripción del salón.
- Servicios, precios y duración.
- Horarios disponibles.
- Dirección, teléfono, email y redes sociales.
- Texto del hero y del footer.

Los colores y dimensiones globales se encuentran al principio de `styles.css`, dentro de las variables de `:root`.

Para cambiar la secuencia visual del hero, sustituye los archivos de `media/frames/` manteniendo el patrón de nombres y actualiza `TOTAL_FRAMES` en `script.js` si la cantidad de imágenes cambia.

## Formularios

Actualmente los formularios de reserva y contacto funcionan únicamente en el navegador:

- La reserva muestra un mensaje de confirmación y limpia los datos del cliente.
- El formulario de contacto muestra un mensaje de agradecimiento y se reinicia.

No existe todavía persistencia, envío de email, integración con WhatsApp ni conexión con un sistema de reservas. Para producción, hay que reemplazar los handlers de `script.js` por una API o servicio externo y evitar mostrar una reserva como confirmada antes de recibir respuesta del servidor.

## Despliegue

Al ser una web estática, puede publicarse en cualquier hosting que sirva archivos estáticos, por ejemplo GitHub Pages, Netlify, Vercel o un servidor web convencional. Basta con desplegar `index.html`, `styles.css`, `script.js` y la carpeta `media/` conservando su estructura.

## Licencia

No se ha definido una licencia para este proyecto.
