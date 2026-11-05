import Script from 'next/script';

/**
 * The existing StatFlows pixel (same appId and options as before). It was
 * previously injected twice (_document and Layout) and its onerror handler
 * referenced an undefined variable; it now loads once, after hydration.
 */
const STATFLOWS = `(function(w,d){try{var s=d.createElement("script");s.src="https://www.statflows.com/js/bundle.min.js";s.async=true;s.onload=function(){if(w.statFlowAnalytics){w.sfa=w.statFlowAnalytics;w.statFlowAnalytics.init({appId:"0ca4f8602efc418fa84739543ed4290b",debugMode:false,autoTrackPageEvents:true,trackErrors:true,trackPerformance:true});}};s.onerror=function(){console.warn("Failed to load analytics");};d.head.appendChild(s);}catch(e){console.warn("Analytics initialization failed:",e);}})(window,document);`;

export default function Analytics() {
  return (
    <Script id="statflows" strategy="afterInteractive">
      {STATFLOWS}
    </Script>
  );
}
