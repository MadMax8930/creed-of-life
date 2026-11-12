import Script from 'next/script';
import { SITE_URL } from '@/lib/site';

/*
 * The existing StatFlows pixel: same appId and options as on the original
 * site. It only runs on the production domain.
 *
 * Why: on localhost the script loaded, but every tracking call it made was
 * answered with an error ("Analytics tracking failed: Network response was not
 * ok"), and test visits do not belong in the site's statistics anyway. The
 * script is therefore not loaded there at all. Two guards, nothing suppressed:
 *
 *   1. Server: no script tag at all in development or on a Vercel deployment
 *      that is not Production (VERCEL_ENV is "preview" or "development").
 *   2. Browser: the loader checks the hostname and does nothing unless it is
 *      the production domain (with or without "www"). This also covers a
 *      local `next start` and the *.vercel.app alias of a production build.
 */
const PRODUCTION_HOST = new URL(SITE_URL).hostname.replace(/^www\./, '');
const ALLOWED_HOSTS = [PRODUCTION_HOST, `www.${PRODUCTION_HOST}`];

const shouldRender =
  process.env.NODE_ENV === 'production' &&
  (process.env.VERCEL_ENV === undefined || process.env.VERCEL_ENV === 'production');

const STATFLOWS = `(function(w,d){if(${JSON.stringify(ALLOWED_HOSTS)}.indexOf(w.location.hostname)===-1)return;try{var s=d.createElement("script");s.src="https://www.statflows.com/js/bundle.min.js";s.async=true;s.onload=function(){if(w.statFlowAnalytics){w.sfa=w.statFlowAnalytics;w.statFlowAnalytics.init({appId:"0ca4f8602efc418fa84739543ed4290b",debugMode:false,autoTrackPageEvents:true,trackErrors:true,trackPerformance:true});}};s.onerror=function(){console.warn("Failed to load analytics");};d.head.appendChild(s);}catch(e){console.warn("Analytics initialization failed:",e);}})(window,document);`;

export default function Analytics() {
  if (!shouldRender) return null;
  return (
    <Script id="statflows" strategy="afterInteractive">
      {STATFLOWS}
    </Script>
  );
}
