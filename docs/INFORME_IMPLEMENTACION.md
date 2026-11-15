# NIGHT//SHIFT — Informe final de implementación

Fecha: 15 de noviembre de 2026 · Rama: `main` · Repositorio: `fgp4321/nightshift`

Este informe cierra las siete fases del plan. Solo figura como probado lo que se ejecutó de verdad; lo que no se pudo probar está en la sección «Sin probar».

## 1. Funcionalidades completadas

**ACT 00 — Arranque**
- Secuencia de terminal de unos 4,4 s, interferencia, logotipo y apertura hacia la ciudad.
- SKIP INTRO con botón o Esc. No se repite dentro de la misma sesión.
- Al terminar, el foco del teclado pasa a la experiencia.

**ACT 01 — Night City (3D en tiempo real)**
- Distrito procedural con semilla fija: edificios instanciados, autopistas elevadas, bulevar, torre Kestrel-Vance de 236 m y terminal holográfico.
- Luz pintada por shaders GLSL: ventanas, tráfico, neones con glifos inventados, lluvia, niebla y holograma. Sin luces, sin posprocesado y sin archivos de modelos o texturas.
- Cámara en cinco planos sobre una línea de tiempo de GSAP guiada por scroll, con paralaje de ratón.
- Rótulos narrativos, datos del distrito con la posición real de la cámara y transición de escaneo hacia NIGHT//OS.

**ACT 02 — NIGHT//OS**
- Escritorio con lanzador, ventanas arrastrables y apilables, y widgets de sistema, red y mensajes.
- NETRUNNER: terminal guionizado con historial; no contacta con ninguna red y lo declara.
- DATABASE: 22 fichas originales en seis secciones, que se abren y se cierran.
- CITY MAP: cinco distritos seleccionables con ratón, toque o teclado.
- NIGHT RADIO: reproducir y pausar, cuatro ambientes, modo automático, volumen, silencio y espectro en vivo.
- Interferencia ligada al scroll: caída de señal, aviso, distorsión y colapso.

**ACT 03 — Neon Underground**
- Callejón, club The Low End, tipografía cruzando el encuadre, muro horizontal de seis carteles originales y túnel de servicio.
- Seis puntos interactivos con contador y mensaje final al encontrarlos todos.

**ACT 04 — Beyond the Grid**
- La ciudad se aleja y se apaga hasta quedar una sola luz; declaración, logotipo y pantalla final.
- Créditos, vuelta a los tres mundos y reinicio completo de la experiencia.

**Interfaz global**
- HUD superior e inferior adaptados a cada mundo, menú a pantalla completa, transición de telón entre actos, enlaces directos (`/#os`, `/#underground`, `/#beyond`) y cursor personalizado solo con ratón.

**Sonido**
- Cinco capas sintetizadas con Web Audio; cada emisora es una mezcla. El ambiente sigue al mundo actual salvo elección manual.
- Efectos de transición sintetizados. Nunca hay reproducción automática.

## 2. Funcionalidades simplificadas o cambiadas respecto al encargo

| Encargo | Lo que se hizo | Motivo |
|---|---|---|
| Howler.js | Web Audio directo, sin archivos | No hay audio que licenciar ni que cargar |
| Pinning de ScrollTrigger | Escenarios fijos por acto; un único conjunto de ScrollTriggers de seguimiento | Redimensionar, refrescar y entrar por enlace directo no descolocan nada |
| Un `ScrollTrigger` por animación | Líneas de tiempo de GSAP en pausa, movidas por el progreso de cada acto | Evita triggers que compitan entre sí |
| Subsuelo «cinemático» | 2D (SVG, CSS, tipografía), no una segunda escena 3D | Mundo visualmente distinto y sin segundo contexto WebGL |
| Shaders de glitch y distorsión a pantalla completa | Glitch con CSS; distorsión con filtro SVG solo en el nivel de calidad alto | Un shader sobre DOM exigiría renderizar el DOM a textura |
| Fuentes de Google | Autoalojadas con Fontsource | Sin peticiones a terceros |
| Carpeta `public/` con modelos, texturas, imágenes y audio | Vacía | Todo es procedural; no se referencia ningún archivo inexistente |

## 3. Limitaciones conocidas

- **Aviso de consola:** React Three Fiber 9.8 emite una advertencia de `THREE.Clock` obsoleto con three 0.187. Viene de la librería y es inofensiva. No hay ningún error de consola.
- **Sin WebGL:** el acto 01 muestra un alzado esquemático en SVG. Funciona, pero es visualmente modesto.
- **Créditos:** no figura nombre de autor; pendiente de que el propietario indique cuál poner.
- **Fuentes:** el build incluye 16 archivos de fuente (todos los subconjuntos de idioma); el navegador solo descarga los 4 latinos.
- **Siluetas del club y callejón:** esquemáticos frente al resto del acto 03.
- **Orden de tabulación tras el arranque:** el foco pasa al contenido, así que el siguiente Tab llega al HUD inferior antes que al superior.

## 4. Pruebas realizadas

Todas sobre el build de producción (`next build` + `next start`) con Chrome sin interfaz gráfica.

**Validación estática:** `tsc --noEmit`, `eslint` y `next build` sin errores.

**Funcionales (todas pasan)**

| Área | Qué se comprobó |
|---|---|
| Arranque | Secuencia completa, bloqueo de scroll, salto con botón y con Esc, sin repetición al recargar, foco al terminar |
| Navegación | Scroll con rueda por los cuatro actos en orden hasta el 100 %, menú, telón, flechas, enlaces directos, doble pulsación rápida, redimensionado, recarga |
| Ciudad | Once puntos del recorrido de cámara, paso al acto 02, sin errores de shader |
| NIGHT//OS | 28 comprobaciones: los ocho comandos del terminal, historial, pestañas y fichas, mapa con clic y teclado, radio completa, arrastre, apilado, Esc, retorno de foco, interferencia en ambos sentidos |
| Subsuelo | Los seis puntos interactivos, contador, mensaje final, cierre con Esc, puntos ocultos no enfocables, paso al acto 04 |
| Final | Controles visibles, vuelta a un mundo, reinicio con arranque |
| Sonido | Sin reproducción automática, cambio de emisora por mundo, elección manual persistente, espectro con señal real |

**Formatos:** escritorio (1440×900 y 1280×800), tablet táctil vertical y horizontal (820×1180 y 1180×820) y móvil táctil (390×844). Sin desbordamiento horizontal en ninguno; todas las aplicaciones caben y funcionan con toque.

**Accesibilidad**
- Auditoría automática axe (WCAG 2.0/2.1 A y AA más buenas prácticas) en nueve estados: ciudad, menú, sistema operativo con cuatro aplicaciones, callejón, mensaje abierto, club, galería y final. Cero infracciones.
- Recorrido solo con teclado: menú, cambio de acto, apertura de aplicación y apertura de punto interactivo.
- Movimiento reducido: los cuatro actos cargan sin errores; la cámara corta entre planos y las transiciones pasan a fundidos.
- Los actos fuera de pantalla no tienen animaciones CSS en marcha ni elementos enfocables.

**Tres comprobaciones figuran en rojo y no son defectos:** la ventana del sistema operativo se detiene en el borde del escritorio; el muro se mide un instante antes del final de su tramo; y en movimiento reducido se mide la posición de un logotipo que ya es invisible.

## 5. Observaciones de rendimiento

El entorno de pruebas renderiza por CPU (sin GPU, 2 núcleos). **Estas cifras no equivalen a FPS reales** y solo sirven para comparar tramos entre sí.

| Medida | Resultado |
|---|---|
| Memoria JS tras 5 recorridos completos | 13,1 → 13,7 MB; se estabiliza |
| Nodos DOM tras los recorridos | 841 → 841 |
| Peticiones en la primera carga | 16, ninguna a servidores externos, ninguna fallida |
| Desplazamiento acumulado de diseño (CLS) | 0,06 |
| Estáticos totales del build | 792 kB comprimidos, incluidos todos los subconjuntos de fuentes |
| Tiempo por fotograma, mediana (NIGHT//OS, callejón, muro, túnel, final) | 16,7 ms |
| Tiempo por fotograma, mediana (club) | 33 ms, antes 150 ms |

Optimizaciones aplicadas en esta fase: el club ya no usa un grupo de mezcla ni sombras de texto de radio amplio; la niebla del callejón se mueve con transformaciones en lugar de repintar; el desenfoque de fondo se desactiva en pantallas táctiles; la ciudad 3D dibuja un solo fotograma mientras la tapa el arranque y se detiene cuando hay otro acto en pantalla.

## 6. Sin probar

- **Rendimiento con GPU real:** FPS de la ciudad 3D en escritorio y, sobre todo, en móviles.
- **Safari (macOS e iOS) y Firefox.** Solo se probó Chrome.
- **Dispositivos físicos:** los formatos táctiles se emularon.
- **Calidad del sonido:** se verificó que el motor genera señal y que los controles funcionan, no cómo suena.
- **Lectores de pantalla** (VoiceOver, NVDA): solo auditoría automática y teclado.
- **Despliegue:** no se ha desplegado en ningún alojamiento.

## 7. Mejoras pendientes recomendadas

1. Medir en dispositivos reales y ajustar los presupuestos de `src/utils/performance.ts`; añadir degradación automática si los FPS caen.
2. Probar en Safari e iOS, donde Web Audio y los filtros SVG suelen comportarse distinto.
3. Escuchar los cuatro ambientes y los efectos, y ajustar la mezcla en `src/data/stations.ts`.
4. Reducir las fuentes al subconjunto latino para aligerar el build.
5. Enriquecer el alzado sin WebGL y las siluetas del club.
6. Añadir imagen para compartir en redes y desplegar.
7. Actualizar React Three Fiber cuando elimine el aviso de `THREE.Clock`.
