import Head from 'next/head';
import {useTranslations} from 'next-intl';
import {ReactNode} from 'react';

type Props = {
  children?: ReactNode;
  title: string;
};

export default function Layout({children, title}: Props) {
  const t = useTranslations('seoJSON');

  return (
    <>
      <Head>
        <title>{[title, t('descHead')].join(' - ')}</title>
        <link rel="icon" href="/favicon.ico" />
        {/* Pixel Tracking Code */}
        <script
               dangerouslySetInnerHTML={{
                  __html: `!function(t,a,n,e,o){try{var c=a.createElement("script");c.src="https://www.statflows.com/js/bundle.min.js",c.type="text/javascript",c.async=!0,c.onload=function(){t.statFlowAnalytics&&(t.sfa=t.statFlowAnalytics,t.statFlowAnalytics.init({appId:"0ca4f8602efc418fa84739543ed4290b",debugMode:!1,autoTrackPageEvents:!0,trackErrors:!0,trackPerformance:!0}))},c.onerror=function(){console.warn("Failed to load analytics from "+serverEndpoint)},a.head.appendChild(c)}catch(t){console.warn("Analytics initialization failed:",t)}}(window,document);`,
               }}
        />
        {/* End Pixel Tracking Code */}
      </Head>
      <div className='min-h-screen flex flex-col items-center bg-primary'>
        {children}
      </div>
    </>
  );
}
