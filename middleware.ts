import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Como usamos localStorage en el cliente, el middleware solo maneja rutas públicas
  // La autenticación real se verifica en los componentes cliente
  
  const pathname = request.nextUrl.pathname;
  
  console.log('MIDDLEWARE:', pathname, '- Permitiendo acceso (auth en cliente)');

  // Permitir todo - la autenticación se maneja en el cliente
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest|logo-principal\\.png|.*\\.png$|.*\\.ico$).*)',
  ],
};
