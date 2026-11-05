import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

export function proxy(request: Parameters<typeof handleI18nRouting>[0]) {
  return handleI18nRouting(request);
}

export const config = {
  // Everything except API routes, Next internals, Vercel internals and files
  // with an extension (favicon.ico, robots.txt, sitemap.xml, images...).
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
