import './globals.css';
import { AppProps } from 'next/app';
import { NextIntlClientProvider } from 'next-intl';

export default function MyApp({ Component, pageProps }: AppProps) {   
   return (
     <NextIntlClientProvider
       locale={pageProps.locale || 'en'} 
       messages={pageProps.mainData}
       timeZone="Europe/Paris"
     >
       <Component {...pageProps} />
     </NextIntlClientProvider>
   );
}
