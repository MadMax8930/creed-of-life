import { AppProps } from 'next/app';
import { NextIntlClientProvider } from 'next-intl';
import '../styles/globals.cs';

export default function MyApp({ Component, pageProps }: AppProps) {   
   return (
     <NextIntlClientProvider
       locale={pageProps.locale || 'en'} 
       messages={pageProps.jsonData}
       timeZone="Europe/Paris"
     >
       <Component {...pageProps} />
     </NextIntlClientProvider>
   );
}
