# Sistema de Diseño LEAL

## Filosofía del Diseño

LEAL se inspira en la rica herencia mexicana, combinando elementos naturales, texturas artesanales y un enfoque auténtico que refleja los valores de frescura, tradición y calidad.

---

## Paleta de Colores

### Colores Principales

| Elemento | Color Visual | Código Hex | Uso | Psicología |
|----------|-------------|------------|-----|------------|
| **Fondo Principal** | Verde Bosque Profundo | `#14533D` | Fondos, contenedores principales, navegación | Representa frescura, ingredientes naturales y herencia mexicana |
| **Acento/Texto** | Crema Orgánico / Kraft | `#C5B48F` | Textos principales, bordes, elementos interactivos | Sugiere texturas naturales, papel reciclado y un toque artesanal/vintage |

### Variaciones de Color

#### Verde Bosque (Forest Green)
```css
--forest-50:  #E8F5F0   /* Tint más claro - fondos sutiles */
--forest-100: #D1EBE1   /* Tint claro - elementos hover */
--forest-200: #A3D7C3   /* Tint medio - estados hover */
--forest-300: #75C3A5   /* Tint oscuro - estados activos */
--forest-400: #47AF87   /* Tint muy oscuro */
--forest-500: #14533D   /* BASE - Color principal */
--forest-600: #0F3E2E   /* Shade claro */
--forest-700: #0A2A1F   /* Shade medio */
--forest-800: #05150F   /* Shade oscuro */
--forest-900: #020A07   /* Shade muy oscuro */
```

#### Crema Kraft (Kraft Cream)
```css
--kraft-50:  #FDFAF3   /* Tint más claro - fondos de sellos */
--kraft-100: #FAF5E7   /* Tint claro - fondos sutiles */
--kraft-200: #F5EBDE   /* Tint medio */
--kraft-300: #EBE1D6   /* Tint oscuro */
--kraft-400: #C5B48F   /* BASE - Color principal */
--kraft-500: #A89D7A   /* Shade claro */
--kraft-600: #8B8265   /* Shade medio */
--kraft-700: #6E6750   /* Shade oscuro */
--kraft-800: #514C3B   /* Shade muy oscuro */
--kraft-900: #343126   /* Shade extremo */
```

### Colores Funcionales

| Color | Hex | Uso | Psicología |
|-------|-----|-----|------------|
| **Éxito** | `#47AF87` | Confirmaciones, estados exitosos | Naturaleza, crecimiento, positivo |
| **Advertencia** | `#C5B48F` (kraft) | Alertas suaves, información | Orgánico, atención sutil |
| **Error** | `#D97757` | Errores, acciones destructivas | Calor, precaución |
| **Información** | `#75C3A5` | Información general | Frescura, comunicación |

---

## Tipografía

### Estética Western/Vintage

El sistema tipográfico de LEAL se apoya en una estética **Western/Vintage** que comunica autenticidad, tradición y carácter artesanal mexicano.

### Familias de Fuentes

#### Logo Principal ("LEAL")
- **Fuente**: `Roboto Slab` (Slab Serif estilo Western/Vintage)
- **Uso**: Logotipo principal, elementos de marca destacados
- **Características**: 
  - Estilo: Slab Serif con características robustas
  - Peso: 700-900 (alto, robusto)
  - Letter-spacing: Normal o `tracking-tight` según tamaño
  - Text-transform: `uppercase` solo para logo de marca
  - **Efecto Distressed**: Text-shadow múltiple para simular textura "gastada" (si se requiere)
  - Filter: `contrast(1.1) brightness(0.98)` para acentuar carácter vintage (opcional)
- **Psicología**: Fuerza, tradición, autenticidad, robustez
- **Clase CSS**: `.logo-text`, `.font-display`

#### Display (Títulos y Encabezados / Labels de Formularios)
- **Fuente**: `Roboto Slab` (Slab Serif Western/Vintage)
- **Uso**: Headers, títulos principales, labels de formularios, elementos destacados
- **Características**: 
  - Peso: 400-900 (variables según necesidad)
  - Letter-spacing: Normal o `tracking-wider` según contexto
  - Text-transform: Normal (no uppercase por defecto)
  - Text-shadow sutil para profundidad en títulos grandes
- **Psicología**: Fuerza, tradición, autenticidad, robustez
- **Clase CSS**: `.font-display`, `.header-text`, `.text-display-*`
- **Uso en componentes**: 
  - Labels de Input/PasswordInput: `font-display`
  - Títulos de páginas: `font-display`
  - Botones principales: `font-display` con `uppercase` opcional

#### Secundaria ("MEXICAN FOOD" y texto secundario)
- **Fuente**: `Roboto` (Sans-serif moderna)
- **Uso**: Subtítulos, texto secundario, etiquetas
- **Pesos**: 400 (regular), 500 (medium), 700 (bold)
- **Características**:
  - Letter-spacing: `0.02em`
  - Diseño limpio y moderno
  - Alta legibilidad en tamaños pequeños
- **Psicología**: Moderna, limpia, equilibrada, legible
- **Clase CSS**: `.text-secondary`, `.text-secondary-bold`, `.text-secondary-medium`

#### Body (Cuerpo de texto y UI)
- **Fuente**: `Inter` (Sans-serif)
- **Uso**: Cuerpo de texto, UI elements, descripciones, formularios
- **Pesos**: 400 (regular), 500 (medium), 600 (semibold)
- **Psicología**: Moderna, limpia, accesible, funcional
- **Clase CSS**: `.text-body-*`

### Escala Tipográfica

```css
/* Logo (Anton) */
.logo-text          /* Clamp(2rem, 8vw, 4rem) - Logotipo principal con efecto distressed */

/* Display (Anton) */
.text-display-xl    /* 3rem / 48px - Hero titles */
.text-display-lg    /* 2rem / 32px - Page titles */
.text-display-md    /* 1.5rem / 24px - Section headers */
.text-display-sm    /* 1.25rem / 20px - Card titles */

/* Secundaria (Roboto) */
.text-secondary     /* Regular - Subtítulos, etiquetas */
.text-secondary-medium /* Medium - Énfasis medio */
.text-secondary-bold   /* Bold - Énfasis fuerte */

/* Body (Inter) */
.text-body-xl       /* 1.125rem / 18px - Large body */
.text-body-lg       /* 1rem / 16px - Standard body */
.text-body-md       /* 0.875rem / 14px - Small body */
.text-body-sm       /* 0.75rem / 12px - Captions, labels */
.text-body-xs       /* 0.625rem / 10px - Tiny labels */
```

### Efecto Distressed (Gastado)

El logotipo "LEAL" utiliza un efecto visual que simula textura gastada y desgastada para reforzar el carácter artesanal:

```css
.logo-text {
  /* Múltiples text-shadows para efecto de profundidad y desgaste */
  text-shadow: 
    2px 2px 0px rgba(20, 83, 61, 0.3),
    -1px -1px 0px rgba(197, 180, 143, 0.2),
    1px 1px 2px rgba(0, 0, 0, 0.1);
  
  /* Ajustes de contraste y brillo para efecto vintage */
  filter: contrast(1.1) brightness(0.98);
}
```

### Características Slab Serif

Las características de "espuelas" laterales y robustez del Slab Serif se logran mediante:
- **Fuente Anton**: Diseñada con características robustas y peso alto
- **Letter-spacing amplio**: `0.08em` - `0.1em` para el logo
- **Text-shadow múltiple**: Simula profundidad y textura
- **Peso visual alto**: La fuente Anton tiene un peso visual robusto que transmite fuerza

---

## Espaciado

### Sistema de Espaciado (Base: 4px)

```
0   = 0px
1   = 4px    (0.25rem)
2   = 8px    (0.5rem)
3   = 12px   (0.75rem)
4   = 16px   (1rem)
6   = 24px   (1.5rem)
8   = 32px   (2rem)
12  = 48px   (3rem)
16  = 64px   (4rem)
```

### Espaciado Semántico

- **Compacto**: `p-3 gap-2` (12px, 8px) - Elementos relacionados
- **Estándar**: `p-4 gap-4` (16px, 16px) - Contenedores normales
- **Espacioso**: `p-6 gap-6` (24px, 24px) - Secciones principales
- **Amplio**: `p-8 gap-8` (32px, 32px) - Hero sections

---

## Bordes y Efectos

### Bordes Rústicos

#### Rustic Border (Borde Principal)
```css
.rustic-border {
  border: 2px solid var(--kraft-cream);
  position: relative;
}

.rustic-border::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  border: 1px dotted var(--kraft-cream);
  pointer-events: none;
}
```
**Uso**: Contenedores principales, tarjetas importantes

#### Vintage Seal (Sello Vintage)
```css
.vintage-seal {
  padding: 12px;
  border: 8px double var(--kraft-cream);
  background-color: #fdfaf3;
  position: relative;
}

.vintage-seal::before {
  content: '';
  position: absolute;
  inset: -4px;
  border: 1px solid var(--kraft-cream);
}
```
**Uso**: QR codes, elementos destacados, sellos de autenticidad

### Radio de Bordes

```css
--radius-none: 0px;        /* Sin bordes redondeados - estilo rústico */
--radius-sm: 2px;          /* Bordes mínimos */
--radius-md: 4px;          /* Bordes estándar */
--radius-full: 9999px;     /* Círculos perfectos */
```

---

## Sombras y Profundidad

### Sistema de Elevación

```css
/* Sin sombra - elementos planos */
shadow-none

/* Sombra sutil - cards hover */
shadow-sm: 0 1px 2px rgba(197, 180, 143, 0.1)

/* Sombra estándar - cards principales */
shadow-md: 0 4px 6px rgba(20, 83, 61, 0.15)

/* Sombra elevada - modales */
shadow-lg: 0 10px 15px rgba(20, 83, 61, 0.2)
```

---

## Componentes Base

### Botones

#### Botón Primario
- **Fondo**: `#C5B48F` (kraft)
- **Texto**: `#14533D` (forest)
- **Estilo**: Header-text, tracking-widest, uppercase
- **Estados**: 
  - Hover: Opacidad 90%
  - Disabled: Opacidad 50%
  - Active: Sombra interna

#### Botón Secundario
- **Borde**: `2px solid #C5B48F`
- **Fondo**: Transparente
- **Texto**: `#C5B48F`
- **Estilo**: Header-text, tracking-widest, uppercase

### Inputs

- **Borde**: `1px solid #C5B48F`
- **Fondo**: `#14533D` (forest)
- **Texto**: `#C5B48F`
- **Placeholder**: `#C5B48F` con opacidad 50%
- **Focus**: Borde `#C5B48F` con opacidad 80%

### Cards

- **Fondo**: `#14533D` (forest) o variaciones
- **Borde**: Rustic border
- **Padding**: `p-6` (24px)
- **Espaciado interno**: `gap-4` (16px)

---

## Iconografía

### Material Symbols Outlined
- **Fuente**: Material Symbols Outlined
- **Variación**: FILL 1, wght 400
- **Tamaños**: 
  - `text-xl` (20px) - Iconos pequeños
  - `text-2xl` (24px) - Iconos estándar
  - `text-3xl` (30px) - Iconos grandes

### Iconos Principales

| Icono | Nombre | Uso |
|-------|--------|-----|
| `potted_plant` | Planta en maceta | Sellos coleccionados |
| `restaurant` | Restaurante | Recompensa final |
| `local_bar` | Bar | Recompensas de bebidas |
| `arrow_back_ios` | Flecha atrás | Navegación |
| `settings` | Configuración | Ajustes |
| `lock` / `lock_open` | Candado | Recompensas bloqueadas/desbloqueadas |
| `check_circle` | Círculo con check | Confirmaciones |

---

## Estados y Feedback

### Estados de Interacción

#### Hover
- **Opacidad**: 90% del elemento
- **Transición**: `transition-all duration-200`

#### Active
- **Opacidad**: 80% del elemento
- **Transform**: `scale(0.98)`

#### Disabled
- **Opacidad**: 50%
- **Cursor**: `not-allowed`

### Feedback Visual

#### Éxito
- **Color**: `#47AF87`
- **Borde**: Verde claro
- **Fondo**: Verde claro con opacidad 10%

#### Error
- **Color**: `#D97757`
- **Borde**: Rojo terroso
- **Fondo**: Rojo terroso con opacidad 10%

#### Carga
- **Spinner**: Color kraft sobre fondo forest
- **Animación**: Rotación suave

---

## Patrones de Layout

### Grid de Sellos
- **Columnas**: 5 (grid-cols-5)
- **Gap**: `gap-4` (16px)
- **Items**: Aspect-square (1:1)

### Contenedor Principal
- **Padding**: `p-6` (24px)
- **Max-width**: Sin límite (pantalla completa en mobile)
- **Fondo**: Forest con patrón de puntos sutiles

### Header Sticky
- **Fondo**: `bg-forest/95` con `backdrop-blur-sm`
- **Z-index**: `z-10`
- **Padding**: `p-6 pb-2`

---

## Responsive Design

### Breakpoints (Tailwind Default)
- **sm**: 640px - Tablets pequeñas
- **md**: 768px - Tablets
- **lg**: 1024px - Laptops
- **xl**: 1280px - Desktop
- **2xl**: 1536px - Large desktop

### Mobile First
- Diseño optimizado para iPhone (375px - 428px)
- Touch targets mínimo: 44x44px (12 en Tailwind)

---

## Accesibilidad

### Contraste
- **Forest (#14533D)** sobre **Kraft (#C5B48F)**: Ratio 4.5:1 ✅
- **Kraft (#C5B48F)** sobre **Forest (#14533D)**: Ratio 4.5:1 ✅

### Touch Targets
- Mínimo: `h-12` (48px)
- Ideal: `h-14` (56px) para elementos críticos

### Focus States
- Outline: `2px solid #C5B48F`
- Outline-offset: `2px`

---

## Ejemplos de Uso

### Código de Ejemplo

```tsx
// Botón Primario
<button className="header-text h-12 bg-primary text-forest font-bold tracking-widest text-sm">
  Acción Principal
</button>

// Botón Secundario
<button className="header-text h-12 border border-primary text-primary font-bold tracking-widest text-sm">
  Acción Secundaria
</button>

// Card con Rustic Border
<div className="rustic-border bg-forest p-6">
  Contenido
</div>

// Sello Vintage
<div className="vintage-seal">
  <QRCode />
</div>
```

---

## Tokens de Diseño (CSS Variables)

```css
:root {
  /* Colores Base */
  --forest-green: #14533D;
  --kraft-cream: #C5B48F;
  
  /* Espaciado */
  --space-unit: 4px;
  
  /* Tipografía */
  --font-logo: 'Roboto Slab', serif;
  --font-display: 'Roboto Slab', serif;
  --font-sans: 'Roboto', sans-serif;
  --font-body: 'Inter', sans-serif;
  
  /* Bordes */
  --border-rustic: 2px solid var(--kraft-cream);
  --border-vintage: 8px double var(--kraft-cream);
  
  /* Transiciones */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
}
```

---

## Patrón de Páginas de Autenticación

**IMPORTANTE**: Todas las páginas de autenticación (Login, Registro, etc.) deben seguir el mismo patrón de diseño para mantener consistencia.

### Componentes y Estilos Estándar

1. **Layout Base**:
   - Fondo: `rustic-texture` (fijo, `fixed inset-0`)
   - Contenedor: `bg-background-dark` con `min-h-screen`
   - Header: `ImmersiveHeader` con logo

2. **Formularios**:
   - Contenedor: `card-blur` con padding responsive
   - Inputs: Usar componentes `Input` y `PasswordInput` (nunca HTML personalizado)
   - Botones: `Button` con `variant="distressed"` para acciones principales
   - Tipografía: `font-display` para labels, `font-body` para texto secundario

3. **Estructura Estándar**:
   ```
   - rustic-texture (fondo fijo)
   - ImmersiveHeader (con logo)
   - main (con margen negativo para overlay)
     - card-blur (contenedor del formulario)
       - form
         - Input/PasswordInput components
         - Button component
     - Sección de navegación/links
   ```

**Ubicaciones de referencia:**
- Login: `app/auth/login/page.tsx`
- Registro: `app/auth/register/page.tsx`

**Para hacer cambios globales:**
- Tipografía: Actualizar en `tailwind.config.ts` y `app/globals.css`
- Componentes: Modificar en `components/ui/`
- Estilos CSS: Actualizar en `app/globals.css`

---

## Guía de Implementación

Este sistema de diseño está implementado en:
- `tailwind.config.ts` - Configuración de colores, tipografía y tema
- `app/globals.css` - Estilos globales, clases utilitarias y variables CSS
- `components/ui/` - Componentes reutilizables (Input, PasswordInput, Button)
- `docs/DESIGN_SYSTEM.md` - Esta documentación
- `docs/COMPONENTS.md` - Documentación de componentes

Para mantener consistencia, siempre usa:
1. Los componentes UI definidos en lugar de crear elementos HTML personalizados
2. Las clases de Tailwind definidas en lugar de estilos inline
3. Los tokens de diseño (variables CSS) para colores y tipografía
4. El patrón estándar de autenticación para páginas de login/registro
