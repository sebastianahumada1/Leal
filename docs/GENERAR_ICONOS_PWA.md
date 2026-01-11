# Generar Iconos para PWA

Los iconos faltantes están causando warnings 404. Sigue estos pasos para generar los iconos necesarios.

## Opción 1: PWA Builder Image Generator (Recomendado)

1. Ve a https://www.pwabuilder.com/imageGenerator
2. Sube tu logo principal (`public/logo-principal.png`)
3. Genera los iconos para PWA
4. Descarga el ZIP con los iconos
5. Extrae los iconos a `public/icons/`

## Opción 2: RealFaviconGenerator

1. Ve a https://realfavicongenerator.net/
2. Sube tu logo principal
3. Configura los tamaños necesarios
4. Genera y descarga los iconos
5. Coloca los iconos en `public/icons/`

## Tamaños Requeridos

Para una PWA completa, necesitas estos tamaños en `public/icons/`:

- `icon-192x192.png` (mínimo requerido)
- `icon-512x512.png` (mínimo requerido)
- `apple-touch-icon.png` (180x180, para iOS)

**Opcional pero recomendado:**
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-384x384.png`

## Estructura de Carpetas

Después de generar los iconos, la estructura debe ser:

```
public/
  icons/
    icon-192x192.png
    icon-512x512.png
    apple-touch-icon.png
    ... (otros tamaños opcionales)
```

## Actualizar Manifest

Una vez que tengas los iconos, puedes actualizar `app/manifest.ts` y `public/manifest.json` para incluir todos los tamaños generados.

## Solución Temporal

Por ahora, el manifest solo incluye los iconos esenciales (192x192 y 512x512). Esto evitará los errores 404, pero deberías generar y agregar todos los iconos para una mejor experiencia PWA.
