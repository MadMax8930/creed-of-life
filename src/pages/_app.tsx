import './globals.css';
import { AppProps } from 'next/app';
import { NextIntlClientProvider } from 'next-intl';

export default function MyApp({ Component, pageProps }: AppProps) {   
   return (
     <NextIntlClientProvider
       locale={pageProps.locale} 
       messages={pageProps.quizData}
     >
       <Component {...pageProps} />
     </NextIntlClientProvider>
   );
}
