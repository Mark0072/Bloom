# Bloom — Prevención Inteligente de Merma en Retail

> **Solución desarrollada para AlphaRamos Week**  
> *Anticipa el riesgo de vencimiento en productos perecederos y lo transforma en acciones operativas antes de que se materialice la pérdida.*

---

## El Problema

En el retail de productos perecederos (lácteos, embutidos, frutas, verduras), la falta de visibilidad en tiempo real sobre los vencimientos por lote genera:

1. **Pérdida económica directa** por merma y destrucción de inventario.
2. **Incompetencia operativa** por revisiones manuales en góndola propensas al error humano.
3. **Impacto ambiental y social** debido al desperdicio ineficiente de alimentos.

---

## La Solución

**Bloom** es una plataforma de analítica predictiva y copiloto operativo que:

- **Identifica automáticamente** inventario crítico por tienda, SKU y lote.
- **Calcula la pérdida económica** proyectada ajustada a la velocidad de venta.
- **Recomienda acciones comerciales o sociales** oportunas (*Descuento Dinámico, Promoción, Redistribución o Donación Controlada*).
- **Proporciona un Shelf Copilot** basado en Inteligencia Artificial que traduce los datos en listas de tareas claras para el personal de tienda.

---

## Características Principales

### Dashboard Ejecutivo (KPIs)
- Pérdida Económica Estimada acumulada.
- Total de Productos/Lotes en riesgo alto, medio y bajo.
- Estimación de Ahorro Potencial recuperable.

### Motor de Riesgo y Matriz de Decisión
- Cálculo de venta esperada vs. inventario disponible antes de expirar.
- Clasificación automatizada en niveles de riesgo (`ALTO`, `MEDIO`, `BAJO`).
- Algoritmo de recomendación basado en margen comercial y días restantes.

### Shelf Copilot (IA Generativa)
- Asistente inteligente alimentado con **Vercel AI SDK**.
- Consulta en lenguaje natural sobre inventario crítico por sucursal.
- Generación de órdenes de trabajo para los colaboradores de piso.

---

## Arquitectura y Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Framework Web** | Next.js 14+ (App Router, Server Actions, TypeScript) |
| **Estilos & UI** | Tailwind CSS + Lucide Icons |
| **Base de Datos** | Neon DB (PostgreSQL Serverless) |
| **ORM** | Drizzle ORM |
| **Inteligencia Artificial** | Vercel AI SDK (Gemini API / OpenAI API / Python Pandas Reasoning Model) |
| **Despliegue** | Vercel |

---

## Puesta en Marcha (Setup)

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone [https://github.com/tu-usuario/bloom-app.git](https://github.com/tu-usuario/bloom-app.git)
cd bloom-app
npm install
