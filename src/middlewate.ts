import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/settings(.*)"])  // Ruta protegida, necesita de logeo

export default clerkMiddleware((auth, req) => {   // auth proporciona métodos para manejar la autenticación, req es la solicitud de comprobación de la ruta
  if(isProtectedRoute(req)) auth().protect()      // Si la ruta es protegida ("/settings") -> necesitas de login para poder visualizarla
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};