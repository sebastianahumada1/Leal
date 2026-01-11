#!/usr/bin/env node

/**
 * PRE-DEPLOY CHECK SCRIPT
 * Verifica que todo esté listo para deployment en Vercel
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_APP_URL',
];

const REQUIRED_FILES = [
  'next.config.js',
  'vercel.json',
  'package.json',
  'tsconfig.json',
  'app/manifest.ts',
  'app/layout.tsx',
];

const REQUIRED_DIRS = [
  'app',
  'components',
  'lib',
  'public',
];

console.log('🔍 PRE-DEPLOY CHECK - LEAL v2.0\n');

let hasErrors = false;
let hasWarnings = false;

// Check 1: Archivos requeridos
console.log('📁 Verificando archivos requeridos...');
REQUIRED_FILES.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  if (exists) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - FALTA`);
    hasErrors = true;
  }
});

// Check 2: Directorios requeridos
console.log('\n📂 Verificando directorios...');
REQUIRED_DIRS.forEach(dir => {
  const exists = fs.existsSync(path.join(process.cwd(), dir));
  if (exists) {
    console.log(`  ✅ ${dir}/`);
  } else {
    console.log(`  ❌ ${dir}/ - FALTA`);
    hasErrors = true;
  }
});

// Check 3: Variables de entorno (ejemplo)
console.log('\n🔐 Variables de entorno requeridas:');
REQUIRED_ENV_VARS.forEach(envVar => {
  console.log(`  ⚠️  ${envVar} - Configurar en Vercel Dashboard`);
});
hasWarnings = true;

// Check 4: package.json scripts
console.log('\n📦 Verificando scripts en package.json...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = ['dev', 'build', 'start', 'lint'];
requiredScripts.forEach(script => {
  if (packageJson.scripts && packageJson.scripts[script]) {
    console.log(`  ✅ npm run ${script}`);
  } else {
    console.log(`  ❌ npm run ${script} - FALTA`);
    hasErrors = true;
  }
});

// Check 5: Dependencias críticas
console.log('\n📚 Verificando dependencias críticas...');
const criticalDeps = [
  'next',
  'react',
  'react-dom',
  '@supabase/supabase-js',
  '@supabase/ssr',
];
criticalDeps.forEach(dep => {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    console.log(`  ✅ ${dep} (${packageJson.dependencies[dep]})`);
  } else {
    console.log(`  ❌ ${dep} - FALTA`);
    hasErrors = true;
  }
});

// Check 6: Iconos PWA
console.log('\n🎨 Verificando iconos PWA...');
const iconPaths = [
  'public/icons/icon-192x192.png',
  'public/icons/icon-512x512.png',
];
let iconsExist = true;
iconPaths.forEach(iconPath => {
  const exists = fs.existsSync(path.join(process.cwd(), iconPath));
  if (exists) {
    console.log(`  ✅ ${iconPath}`);
  } else {
    console.log(`  ⚠️  ${iconPath} - OPCIONAL (recomendado para PWA)`);
    iconsExist = false;
  }
});
if (!iconsExist) {
  hasWarnings = true;
}

// Check 7: Build test
console.log('\n🏗️  Build test...');
console.log('  ℹ️  Ejecuta "npm run build" para verificar que compila');

// Check 8: Linter
console.log('\n🔍 Linter...');
console.log('  ℹ️  Ejecuta "npm run lint" para verificar código');

// Resumen
console.log('\n' + '='.repeat(50));
console.log('📊 RESUMEN');
console.log('='.repeat(50));

if (hasErrors) {
  console.log('❌ ERRORES ENCONTRADOS - Corregir antes de deploy');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  WARNINGS - Revisar antes de deploy');
  console.log('\n✅ Archivos básicos OK');
  console.log('📝 Pendientes:');
  console.log('   1. Configurar variables de entorno en Vercel');
  console.log('   2. Generar iconos PWA (opcional)');
  console.log('   3. Ejecutar "npm run build" para verificar');
  console.log('   4. Ejecutar "npm run lint" para verificar código');
  console.log('   5. Habilitar RLS en Supabase (producción)');
  process.exit(0);
} else {
  console.log('✅ TODO LISTO PARA DEPLOY');
  process.exit(0);
}
