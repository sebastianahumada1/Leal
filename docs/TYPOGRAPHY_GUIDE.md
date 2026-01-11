# Guía de Tipografía LEAL

## Filosofía Tipográfica

El sistema tipográfico de LEAL se basa en una **estética Western/Vintage** que comunica autenticidad, tradición y carácter artesanal mexicano. La combinación de fuentes robustas y modernas crea un equilibrio entre tradición y funcionalidad.

---

## Jerarquía Tipográfica

### 1. Logo Principal - "LEAL"

**Fuente**: Anton (Slab Serif estilo Western)

**Características**:
- Estilo robusto con peso alto
- Efecto "distressed" (gastado) para carácter artesanal
- Características de Slab Serif con "espuelas" laterales simuladas
- Letter-spacing amplio: `0.1em`

**Uso**:
```tsx
import Logo from '@/components/Logo';

<Logo variant="default" showSubtitle />
<Logo variant="small" />
<Logo variant="large" />
```

**Clase CSS directa**:
```tsx
<h1 className="logo-text" data-text="LEAL">LEAL</h1>
```

**Tamaños disponibles**:
- `default`: `text-4xl md:text-5xl` (2rem - 3rem)
- `small`: `text-2xl md:text-3xl` (1.5rem - 1.875rem)
- `large`: `text-5xl md:text-7xl` (3rem - 4.5rem)

---

### 2. Display - Títulos y Encabezados

**Fuente**: Anton

**Características**:
- Peso alto y robusto
- Letter-spacing: `0.08em`
- Text-transform: `uppercase`
- Text-shadow sutil para profundidad

**Clases disponibles**:
- `.text-display-xl` - 3rem / 48px - Hero titles
- `.text-display-lg` - 2rem / 32px - Page titles
- `.text-display-md` - 1.5rem / 24px - Section headers
- `.text-display-sm` - 1.25rem / 20px - Card titles
- `.header-text` - Estilo general para headers (mantiene compatibilidad)

**Ejemplo de uso**:
```tsx
<h1 className="text-display-xl text-primary">Título Principal</h1>
<h2 className="text-display-lg text-primary">Título de Sección</h2>
<h3 className="header-text text-primary">Subsección</h3>
```

---

### 3. Secundaria - "MEXICAN FOOD" y Texto Secundario

**Fuente**: Roboto (Sans-serif moderna)

**Características**:
- Diseño limpio y moderno
- Alta legibilidad en tamaños pequeños
- Letter-spacing: `0.02em`
- Equilibra el diseño robusto del logo

**Clases disponibles**:
- `.text-secondary` - Regular (400)
- `.text-secondary-medium` - Medium (500)
- `.text-secondary-bold` - Bold (700)

**Ejemplo de uso**:
```tsx
<p className="text-secondary">MEXICAN FOOD</p>
<p className="text-secondary-medium">Etiqueta con énfasis</p>
<p className="text-secondary-bold">Texto destacado</p>
```

---

### 4. Body - Cuerpo de Texto y UI

**Fuente**: Inter

**Características**:
- Optimizada para legibilidad en UI
- Pesos: 400, 500, 600
- Sin transformaciones adicionales

**Clases disponibles**:
- `.text-body-xl` - 1.125rem / 18px - Large body
- `.text-body-lg` - 1rem / 16px - Standard body
- `.text-body-md` - 0.875rem / 14px - Small body
- `.text-body-sm` - 0.75rem / 12px - Captions, labels
- `.text-body-xs` - 0.625rem / 10px - Tiny labels (uppercase)

**Ejemplo de uso**:
```tsx
<p className="text-body-lg">Párrafo principal</p>
<p className="text-body-md">Texto secundario</p>
<span className="text-body-xs">Etiqueta pequeña</span>
```

---

## Efecto Distressed (Gastado)

El logotipo "LEAL" utiliza técnicas CSS avanzadas para simular textura gastada y desgastada:

### Implementación

```css
.logo-text {
  /* Múltiples text-shadows para efecto de profundidad */
  text-shadow: 
    2px 2px 0px rgba(20, 83, 61, 0.3),
    -1px -1px 0px rgba(197, 180, 143, 0.2),
    1px 1px 2px rgba(0, 0, 0, 0.1);
  
  /* Ajustes de contraste y brillo */
  filter: contrast(1.1) brightness(0.98);
}
```

### Características Visuales

1. **Profundidad**: Text-shadow múltiple crea sensación de relieve
2. **Desgaste**: Colores sutiles superpuestos simulan envejecimiento
3. **Textura**: Filter effects acentúan el carácter vintage
4. **Espuelas laterales**: Gradientes sutiles simulan características Slab Serif

---

## Características Slab Serif

Las características de "espuelas" laterales y robustez se logran mediante:

1. **Fuente Anton**: Diseñada con características robustas y peso alto
2. **Letter-spacing amplio**: `0.08em` - `0.1em` crea sensación de amplitud
3. **Text-shadow múltiple**: Simula profundidad y textura
4. **Peso visual alto**: La fuente Anton tiene un peso visual robusto

---

## Guía de Uso por Contexto

### Pantalla de Login
```tsx
<div className="text-center">
  <Logo variant="large" showSubtitle className="mb-8" />
  <h2 className="text-display-md text-primary mb-4">Bienvenido</h2>
  <p className="text-body-lg text-primary/80">Ingresa tus credenciales</p>
</div>
```

### Header de Página
```tsx
<h2 className="header-text text-primary text-lg font-bold text-center">
  Loyalty Card
</h2>
```

### Tarjeta de Contenido
```tsx
<div className="rustic-border bg-forest p-6">
  <h3 className="text-display-sm text-primary mb-2">Título de Tarjeta</h3>
  <p className="text-body-md text-primary/80">Descripción del contenido</p>
</div>
```

### Botones
```tsx
<button className="header-text h-12 bg-primary text-forest font-bold tracking-widest text-sm">
  Acción Principal
</button>
```

---

## Variables CSS

```css
:root {
  --font-logo: 'Anton', sans-serif;
  --font-display: 'Anton', sans-serif;
  --font-sans: 'Roboto', sans-serif;
  --font-body: 'Inter', sans-serif;
}
```

---

## Mejores Prácticas

### ✅ Hacer

- Usar `.logo-text` solo para el logotipo principal "LEAL"
- Usar `.header-text` o `.text-display-*` para títulos y encabezados
- Usar `.text-secondary` para subtítulos y etiquetas como "MEXICAN FOOD"
- Usar `.text-body-*` para contenido legible y UI
- Mantener letter-spacing amplio en elementos display
- Aplicar text-transform uppercase a títulos y headers

### ❌ Evitar

- No usar `.logo-text` para texto que no sea el logotipo
- No mezclar múltiples familias de fuentes en el mismo elemento
- No reducir demasiado el letter-spacing en elementos display
- No usar text-transform lowercase en títulos
- No aplicar efectos distressed a texto que no sea el logo

---

## Responsive Typography

Las fuentes se adaptan automáticamente:

```css
/* Logo responsive */
.logo-text {
  font-size: clamp(2rem, 8vw, 4rem);
}

/* Display responsive con Tailwind */
.text-display-xl {
  @apply text-3xl md:text-4xl lg:text-5xl;
}
```

---

## Accesibilidad

### Contraste

Todas las combinaciones de color cumplen con WCAG AA:
- `text-primary` sobre `bg-forest`: ✅ 4.5:1
- `text-kraft-400` sobre `bg-forest`: ✅ 4.5:1

### Tamaños Mínimos

- Texto legible: Mínimo `text-body-sm` (12px)
- Touch targets: Mínimo `h-12` (48px)
- Espaciado entre líneas: Mínimo `line-height: 1.4`

---

## Ejemplos Visuales

### Logotipo Completo
```
    LEAL
MEXICAN FOOD
```

### Título de Sección
```
TU PROGRESO
```

### Contenido de Tarjeta
```
Título de la Recompensa
Descripción del contenido con
texto legible y claro.
```
