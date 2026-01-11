# Componentes UI - Sistema LEAL

## Componentes Reutilizables Creados

### Input
Componente de entrada de texto con estilo smooth-border.

**Ubicación**: `components/ui/Input.tsx`

**Props**:
- `label?: string` - Etiqueta del input
- `error?: string` - Mensaje de error a mostrar
- `containerClassName?: string` - Clases adicionales para el contenedor
- Todos los props estándar de HTML input

**Ejemplo de uso**:
```tsx
import { Input } from '@/components/ui/Input';

<Input
  label="Correo Electrónico"
  type="email"
  placeholder="tu@correo.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={error}
/>
```

---

### PasswordInput
Componente de entrada de contraseña con toggle de visibilidad.

**Ubicación**: `components/ui/PasswordInput.tsx`

**Props**:
- `label?: string` - Etiqueta del input
- `error?: string` - Mensaje de error a mostrar
- `containerClassName?: string` - Clases adicionales para el contenedor
- Todos los props estándar de HTML input (excepto type)

**Características**:
- Toggle automático de visibilidad/ocultación
- Icono de Material Symbols que cambia dinámicamente
- Estilo smooth-border consistente

**Ejemplo de uso**:
```tsx
import { PasswordInput } from '@/components/ui/PasswordInput';

<PasswordInput
  label="Contraseña"
  placeholder="••••••••"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  error={error}
/>
```

---

### Button
Componente de botón con múltiples variantes.

**Ubicación**: `components/ui/Button.tsx`

**Props**:
- `variant?: 'primary' | 'secondary' | 'distressed'` - Estilo del botón
- `size?: 'sm' | 'md' | 'lg'` - Tamaño del botón
- `fullWidth?: boolean` - Ancho completo
- Todos los props estándar de HTML button

**Variantes**:
- **primary**: Botón principal con fondo kraft
- **secondary**: Botón con borde, fondo transparente
- **distressed**: Botón con fondo texturizado y borde punteado interno

**Ejemplo de uso**:
```tsx
import { Button } from '@/components/ui/Button';

<Button variant="distressed" size="lg" fullWidth>
  INICIAR SESIÓN
</Button>

<Button variant="primary" size="md">
  Acción Principal
</Button>

<Button variant="secondary" size="sm">
  Acción Secundaria
</Button>
```

---

### ImmersiveHeader
Componente de header inmersivo con imagen de fondo.

**Ubicación**: `components/ImmersiveHeader.tsx`

**Props**:
- `icon?: string` - Nombre del icono Material Symbols
- `title: string` - Título principal (generalmente "LEAL")
- `subtitle?: string` - Subtítulo opcional
- `backgroundImage?: string` - URL de la imagen de fondo

**Características**:
- Imagen de fondo con overlay oscuro
- Icono grande de Material Symbols
- Título con efecto distressed
- Responsive y adaptable

**Ejemplo de uso**:
```tsx
import ImmersiveHeader from '@/components/ImmersiveHeader';

<ImmersiveHeader
  icon="restaurant_menu"
  title="LEAL"
  subtitle="Auténtico Sabor Mexicano"
/>
```

---

### Logo
Componente de logotipo con efecto distressed.

**Ubicación**: `components/Logo.tsx`

**Props**:
- `variant?: 'default' | 'small' | 'large'` - Tamaño del logo
- `showSubtitle?: boolean` - Mostrar subtítulo "MEXICAN FOOD"
- `className?: string` - Clases adicionales

**Ejemplo de uso**:
```tsx
import Logo from '@/components/Logo';

<Logo variant="large" showSubtitle />
```

---

## Clases CSS Utilitarias

### Estilos de Input
- `.input-smooth-border` - Borde suave y redondeado para inputs
- `.password-input-smooth-border-left` - Borde izquierdo para campo de contraseña
- `.password-icon-smooth-border-right` - Borde derecho para icono de visibilidad

### Estilos de Botón
- `.distressed-bg` - Fondo texturizado con imagen distressed
- `.dotted-border` - Borde punteado para elementos decorativos

### Estilos de Layout
- `.rustic-texture` - Textura de fondo rustica con baja opacidad
- `.immersive-header` - Header con imagen de fondo y overlay
- `.card-blur` - Card con fondo semitransparente y blur effect
- `.leal-distressed-text` - Texto con efecto distressed para logo

### Tipografía
- `.font-display` - Fuente Roboto Slab para labels, títulos y elementos destacados
- `.font-body` - Fuente Inter para cuerpo de texto y UI
- `.font-sans-clarity` - Alias de `.font-body` (Inter) para legibilidad
- `.header-text` - Fuente Roboto Slab para títulos y headers (usar `font-display` en su lugar)

---

## Patrones de Uso

### Página de Autenticación Estándar (Login/Registro)

**Este es el patrón estándar que debe usarse en todas las páginas de autenticación para mantener consistencia.**

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImmersiveHeader from '@/components/ImmersiveHeader';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';

export default function AuthPage() {
  // ... lógica del formulario ...

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-dark text-primary selection:bg-primary/30 antialiased">
      {/* Textura Rustica de Fondo - SIEMPRE usar */}
      <div className="fixed inset-0 rustic-texture"></div>

      {/* Header Inmersivo - SIEMPRE usar con logo */}
      <ImmersiveHeader
        useLogo={true}
        logoImage="/logo-principal.png"
        logoAlt="LEAL Mexican Food"
      />

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 flex flex-col items-center -mt-3 sm:-mt-4 md:-mt-5 z-20 relative">
        {/* Card con blur - SIEMPRE usar esta clase */}
        <div className="card-blur backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-xl border border-primary/20 shadow-lg max-w-[480px] w-full">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Usar componentes Input/PasswordInput - NO crear inputs personalizados */}
            <Input
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              error={error && error.includes('email') ? error : undefined}
            />
            
            <PasswordInput
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              error={error && error.includes('password') ? error : undefined}
            />

            {/* Mensajes de error */}
            {error && !error.includes('email') && !error.includes('password') && (
              <div className="text-error text-sm font-body px-1">
                {error}
              </div>
            )}

            {/* Botón principal - SIEMPRE variant="distressed" para acciones principales */}
            <div className="pt-2 pb-1">
              <Button
                type="submit"
                variant="distressed"
                size="lg"
                fullWidth
                disabled={loading}
                className="h-16 text-lg tracking-[0.15em]"
              >
                {loading ? 'Procesando...' : 'ACCIÓN PRINCIPAL'}
              </Button>
            </div>
          </form>
        </div>

        {/* Sección de navegación/links */}
        <div className="mt-8 flex flex-col items-center gap-4 pb-12 max-w-[480px] w-full">
          {/* Separador opcional */}
          <div className="flex items-center gap-4 w-full">
            <div className="h-[1px] bg-primary/20 flex-1"></div>
            <span className="text-primary/40 text-xs font-body uppercase tracking-widest">
              O continúa con
            </span>
            <div className="h-[1px] bg-primary/20 flex-1"></div>
          </div>

          {/* Links */}
          <p className="text-primary/90 text-base font-body mt-4">
            ¿Ya tienes cuenta?
            <Link
              href="/auth/login"
              className="text-primary font-bold underline decoration-primary underline-offset-4 ml-1 hover:opacity-80 transition-opacity font-body"
            >
              Inicia Sesión
            </Link>
          </p>
        </div>
      </main>

      <div className="h-8 bg-background-dark"></div>
    </div>
  );
}
```

**Elementos estándar que DEBEN usarse en todas las páginas de autenticación:**
1. ✅ `rustic-texture` como fondo fijo
2. ✅ `ImmersiveHeader` con `useLogo={true}`
3. ✅ `card-blur` para el contenedor del formulario
4. ✅ Componentes `Input` y `PasswordInput` (nunca inputs HTML personalizados)
5. ✅ `Button` con `variant="distressed"` para acción principal
6. ✅ Misma estructura de layout y espaciado
7. ✅ Tipografía: `font-display` para labels, `font-body` para texto secundario

### Card con Blur
```tsx
<div className="card-blur backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-primary/20 shadow-lg">
  {/* Contenido */}
</div>
```

### Header Inmersivo Completo
```tsx
<div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
  <div className="fixed inset-0 rustic-texture"></div>
  
  <ImmersiveHeader
    icon="restaurant_menu"
    title="LEAL"
    subtitle="Auténtico Sabor Mexicano"
  />
  
  <main className="flex-1 px-6 flex flex-col items-center -mt-16 sm:-mt-20 z-10">
    {/* Contenido principal */}
  </main>
</div>
```

---

## Mejores Prácticas

### ✅ Hacer

- Usar los componentes UI para mantener consistencia
- Aplicar `card-blur` para cards sobre fondos con textura
- Usar `rustic-texture` como fondo fijo para páginas completas
- Implementar `ImmersiveHeader` en páginas de autenticación
- Usar `distressed` variant solo para acciones principales importantes

### ❌ Evitar

- No crear inputs personalizados fuera de los componentes UI
- No usar múltiples texturas de fondo superpuestas
- No aplicar `distressed-bg` a múltiples elementos pequeños
- No sobrescribir estilos base de componentes sin necesidad

---

## Responsive Design

Todos los componentes están diseñados para ser responsive:

- **Input/PasswordInput**: Se adaptan al contenedor padre
- **Button**: Mantiene proporciones en diferentes tamaños
- **ImmersiveHeader**: Ajusta padding y tamaños en mobile/desktop
- **Logo**: Usa `clamp()` para escalado fluido

---

## Accesibilidad

- Todos los inputs tienen labels asociados
- Los botones tienen estados disabled claros
- Los iconos tienen text alternativo cuando es necesario
- Focus states están implementados para navegación por teclado
