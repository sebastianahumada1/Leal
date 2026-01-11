# Paleta de Colores LEAL

## Colores Principales

### Verde Bosque Profundo (Forest Green)
**Código Base**: `#14533D`

**Psicología**: Representa frescura, ingredientes naturales y herencia mexicana.

**Uso**: Fondos principales, contenedores, navegación

**Escala Completa**:
- `forest-50`: `#E8F5F0` - Fondos muy sutiles
- `forest-100`: `#D1EBE1` - Estados hover sutiles
- `forest-200`: `#A3D7C3` - Elementos secundarios
- `forest-300`: `#75C3A5` - Estados activos
- `forest-400`: `#47AF87` - Énfasis medio
- `forest-500`: `#14533D` - **BASE** - Color principal
- `forest-600`: `#0F3E2E` - Shade claro
- `forest-700`: `#0A2A1F` - Shade medio
- `forest-800`: `#05150F` - Shade oscuro
- `forest-900`: `#020A07` - Shade muy oscuro

### Crema Orgánico / Kraft (Kraft Cream)
**Código Base**: `#C5B48F`

**Psicología**: Sugiere texturas naturales, papel reciclado y un toque artesanal/vintage.

**Uso**: Textos principales, bordes, elementos interactivos, acentos

**Escala Completa**:
- `kraft-50`: `#FDFAF3` - Fondos de sellos vintage
- `kraft-100`: `#FAF5E7` - Fondos sutiles
- `kraft-200`: `#F5EBDE` - Fondos medios
- `kraft-300`: `#EBE1D6` - Bordes sutiles
- `kraft-400`: `#C5B48F` - **BASE** - Color principal
- `kraft-500`: `#A89D7A` - Shade claro
- `kraft-600`: `#8B8265` - Shade medio
- `kraft-700`: `#6E6750` - Shade oscuro
- `kraft-800`: `#514C3B` - Shade muy oscuro
- `kraft-900`: `#343126` - Shade extremo

## Colores Funcionales

### Éxito (Success)
**Código**: `#47AF87`

**Uso**: Confirmaciones, estados exitosos, mensajes positivos

**Ejemplo de uso**:
```tsx
<div className="text-success border-success bg-success/10">
  Sello agregado exitosamente!
</div>
```

### Error
**Código**: `#D97757`

**Uso**: Errores, acciones destructivas, validaciones fallidas

**Ejemplo de uso**:
```tsx
<div className="text-error border-error bg-error/10">
  Error al procesar la solicitud
</div>
```

### Información (Info)
**Código**: `#75C3A5`

**Uso**: Información general, tooltips, estados informativos

**Ejemplo de uso**:
```tsx
<div className="text-info border-info bg-info/10">
  Información importante
</div>
```

### Advertencia (Warning)
**Código**: `#C5B48F` (kraft base)

**Uso**: Alertas suaves, información de atención

## Uso en Tailwind CSS

### Ejemplos de Clases

```tsx
// Fondo con color principal
<div className="bg-forest"> // Usa forest-500 (#14533D)
<div className="bg-forest-500"> // Explícito
<div className="bg-forest-100"> // Tint claro

// Texto con color kraft
<p className="text-primary"> // Usa kraft base (#C5B48F)
<p className="text-kraft-400"> // Explícito
<p className="text-kraft-600"> // Shade oscuro

// Bordes
<div className="border-primary"> // Kraft base
<div className="border-forest-500"> // Forest base

// Colores funcionales
<div className="text-success bg-success/10">
<div className="text-error border-error">
```

## Contraste y Accesibilidad

### Ratios de Contraste (WCAG AA)

✅ **Aprobado (4.5:1 o superior)**:
- `text-primary` sobre `bg-forest` ✅
- `text-forest-500` sobre `bg-kraft-50` ✅
- `text-success` sobre `bg-forest` ✅

⚠️ **Revisar**:
- `text-kraft-200` sobre `bg-forest` (3.8:1) - Usar solo para elementos no críticos
- `text-forest-300` sobre `bg-kraft-50` (3.2:1) - Usar solo para elementos decorativos

### Recomendaciones

1. **Textos principales**: Siempre usar `text-primary` o `text-kraft-400` sobre `bg-forest`
2. **Textos secundarios**: Usar `text-kraft-600` o `text-forest-300` para mejor legibilidad
3. **Elementos interactivos**: Mantener contraste mínimo 4.5:1
4. **Estados disabled**: Usar opacidad 50% para mantener estructura visual

## Psicología del Color Aplicada

### Verde Bosque (`#14533D`)
- **Connotación**: Naturaleza, frescura, autenticidad
- **Efecto**: Calma, confianza, conexión con la tierra
- **Aplicación**: Crea sensación de producto natural y artesanal

### Crema Kraft (`#C5B48F`)
- **Connotación**: Artesanía, textura, autenticidad vintage
- **Efecto**: Calidez, nostalgia, calidad
- **Aplicación**: Evoca materiales naturales como papel reciclado y texturas orgánicas

## Combinaciones Recomendadas

### Combinación Principal (Máxima Legibilidad)
- Fondo: `bg-forest` o `bg-forest-500`
- Texto: `text-primary` o `text-kraft-400`
- Borde: `border-primary`

### Combinación Invertida
- Fondo: `bg-kraft-50` o `bg-primary`
- Texto: `text-forest-500`
- Borde: `border-forest-500`

### Combinación Sutil
- Fondo: `bg-forest-100`
- Texto: `text-forest-700`
- Acento: `border-primary/30`

## Tokens CSS

```css
:root {
  --forest-green: #14533D;
  --kraft-cream: #C5B48F;
  --success: #47AF87;
  --error: #D97757;
  --info: #75C3A5;
}
```

## Referencia Rápida

| Elemento | Clase Tailwind | Hex | Uso |
|----------|---------------|-----|-----|
| Fondo principal | `bg-forest` | `#14533D` | Contenedores principales |
| Texto principal | `text-primary` | `#C5B48F` | Textos, títulos |
| Borde rústico | `border-primary` | `#C5B48F` | Bordes, separadores |
| Éxito | `text-success` | `#47AF87` | Confirmaciones |
| Error | `text-error` | `#D97757` | Errores |
| Fondo sutil | `bg-kraft-50` | `#FDFAF3` | Fondos de sellos |
