# Bloom (PoC) — Compra Asistida para Aprezio y Sirena

## Descripción

**Bloom** es el nombre interno de una solución de compra asistida para tiendas físicas de **Aprezio** y **Sirena** (Grupo Ramos), pensada para clientes con presupuesto limitado, baja familiaridad digital, adultos mayores y personas que necesitan asistencia adicional.

Este repositorio es un **PoC (Proof of Concept) de hackathon**, no un producto final. El objetivo es demostrar el flujo completo de la experiencia — consulta de productos, canasta dinámica por presupuesto, Ofertas de Rescate, ruta de compra, asistencia en tienda y ticket con QR — en una interfaz mínima y funcional lista para tableta/kiosco vertical.

En la interfaz visible **nunca aparece la palabra "Bloom"**: el cliente solo ve "Aprezio" o "Sirena" según la tienda que seleccione al inicio.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** para estilos
- **Zustand** (con persistencia en `localStorage`) para estado de cliente
- **qrcode.react** para generar códigos QR reales y escaneables
- Datos 100% locales en [`data/productos.json`](data/productos.json) — sin backend, sin base de datos, sin SAP real, sin login, sin pago

## Cómo instalar

```bash
npm install
```

## Cómo ejecutar

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en un navegador. Para una experiencia fiel al kiosco, usa las herramientas de desarrollador del navegador para simular una pantalla vertical tipo tableta (ej. 768×1024 o 820×1180).

Para una build de producción:

```bash
npm run build
npm run start
```

## Flujo de demo sugerido

1. Abre la app → pantalla de inicio → **Comenzar**.
2. Selecciona **Aprezio** o **Sirena**.
3. Selecciona idioma (**Español** / **English**).
4. En Inicio, entra a **Consultar productos** y busca un producto (ej. "arroz") para ver disponibilidad, precio, pasillo y estado.
5. Vuelve a Inicio → **Armar mi canasta**.
6. Ingresa presupuesto **RD$2,500**, 3 personas, tipo **Compra básica**.
7. Selecciona preferencias **Ahorro máximo** y **Compra balanceada**; opcionalmente marca una alergia (ej. Leche/lácteos) para ver cómo se excluyen productos.
8. Genera la canasta → revisa total, presupuesto restante y la explicación de por qué se eligieron los productos.
9. Continúa a **Ofertas de Rescate**, acepta ver las ofertas, agrega un producto con descuento y/o un combo manual.
10. Continúa a **Ver ruta de compra** para ver el recorrido sugerido por zonas del local.
11. Ve a **Asistencia en tienda** y solicita ayuda (ej. "Apoyo por movilidad reducida").
12. Continúa a la pantalla de confirmación (**Ruta de compra**) y presiona **Generar ticket con QR**.
13. En la pantalla del ticket, escanea el QR con otro dispositivo (o copia el enlace) para abrir `/ticket/view` de forma independiente.
14. Presiona **Continuar** → pantalla de agradecimiento → **Nueva compra** para reiniciar el flujo completo.
15. Visita `/admin` para ver el panel demostrativo con canastas generadas, ahorro promedio, solicitudes de asistencia, etc.

## Qué está simulado

- **Inventario y precios**: provienen íntegramente de `data/productos.json`, un dataset simulado que representa lo que en producción vendría de SAP Retail / la capa de datos de Grupo Ramos.
- **Ofertas de Rescate**: los descuentos y días restantes ya vienen precalculados en el dataset (o se calculan con una política de markdown centralizada en [`lib/rescue.ts`](lib/rescue.ts)); no hay conexión real a inventario perecedero.
- **Bundles manuales**: definidos a mano en `manualBundles` dentro del JSON; no se generan con IA.
- **Ruta de compra**: se calcula ordenando los productos de la canasta según el layout simulado (`stores[].layout.zones`) de cada tienda — no hay mapeo real de planograma.
- **Asistencia en tienda**: las solicitudes se guardan en `localStorage` (ver [`lib/assistance.ts`](lib/assistance.ts)); no hay notificación real a un colaborador ni chat en vivo.
- **Ticket y QR**: el ticket se codifica en base64url dentro de la URL del QR (`/ticket/view?data=...`), por lo que un QR escaneado desde **otro dispositivo** puede abrir y mostrar el ticket sin depender del `localStorage` original. Es un ticket demostrativo, no representa una compra ni un pago real.
- **Panel admin** (`/admin`): cuenta canastas generadas, ahorro promedio, Ofertas de Rescate y bundles agregados durante la sesión actual del navegador; es un panel demostrativo, no un dashboard de negocio real.
- **Modo accesible**: alto contraste básico, texto grande y lectura en voz alta vía **Web Speech API** del navegador (con aviso si el dispositivo no la soporta).

## Cómo usar `productos.json`

El archivo vive en [`data/productos.json`](data/productos.json) y contiene:

- `stores`: las dos tiendas (`APZ-001` Aprezio, `SIR-001` Sirena), su nombre público, y el layout de zonas/pasillos usado para la ruta de compra.
- `basketOptions`: catálogos de tipos de canasta, preferencias, restricciones y alergias que alimentan el formulario de `/basket/start`.
- `rescuePolicy`: política de descuento por categoría de perecedero, usada como referencia/fallback en `lib/rescue.ts`.
- `manualBundles`: combos configurados manualmente por tienda.
- `products[]`: cada producto trae atributos generales (`attributes`) y un bloque `stores.APZ-001` / `stores.SIR-001` con precio, stock, disponibilidad, promoción y datos de rescate específicos de esa tienda.

Toda la lógica que lee este archivo vive en [`lib/products.ts`](lib/products.ts). Si reemplazas el JSON por otro compatible con esta forma, el resto de la app sigue funcionando sin cambios de código.

## Limitaciones del PoC

- No hay backend, base de datos ni integración real con SAP, Sirena Go o sistemas de caja.
- No hay autenticación ni protección de datos — `/admin` es de acceso libre, como corresponde a un panel demostrativo.
- El inventario es estático (no cambia con el tiempo real ni con compras concurrentes de otros usuarios).
- Las imágenes de producto son íconos/placeholders por categoría, no fotografías reales.
- El diseño visual es intencionalmente mínimo; está preparado para reemplazar componentes visuales por los prototipos de Canva sin tocar la lógica de negocio (`lib/*.ts`).
- Una canasta con muchísimos productos puede generar un ticket demasiado grande para codificar en un QR; en ese caso la app muestra el enlace del ticket como alternativa en vez del código QR.

## Qué se podría conectar después

- **SAP Retail / capa interna de Grupo Ramos** en lugar de `data/productos.json`, para precio, stock y promociones en tiempo real.
- **Sirena Go** u otro sistema de checkout para convertir el ticket demostrativo en una compra real.
- Un servicio de **asistencia en tienda** con notificación push real a colaboradores (en lugar de `localStorage`).
- Un **planograma real** de cada tienda para calcular la ruta de compra con precisión de pasillo/estante.
- Un **CMS o backoffice** para configurar bundles y Ofertas de Rescate sin tocar el JSON a mano.
- Autenticación y control de acceso para el panel `/admin`.
- Analítica real (no simulada) de canastas, ahorro y uso de asistencia para el panel administrativo.

---

*Este proyecto es un PoC construido para el hackathon interno de Grupo Ramos. No representa un producto final ni una compra real.*
