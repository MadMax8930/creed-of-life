import Layout from '@/components/Layout';
import Language from '@/components/Language';
import Introduction from '@/components/Introduction';
import Donation from '@/components/Donation';
import MainView from '@/components/MainView';
// import WDisplay from '@/components/WDisplay';  // for v2
import Conclusion from '@/components/Conclusion';
import { GetStaticPropsContext } from 'next';
import { DbData } from '@/types/mongo';
import axios from 'axios';

export default function Home({ dbData, locale }: { dbData: DbData, locale: string }) {

  return (
    <Layout title="Creed Of Live 101">
      <div className='min-h-screen flex flex-col'>
        <Language />
        <Introduction />
        <div className='relative pb-12'>
           {/* Background Image Layer */}
           <div className='absolute inset-0 bg-hero-pattern bg-cover bg-center opacity-30 xs:rounded-lg rounded-none' />
           {/* Main Content Layer */}
           <div className='flex-1 relative z-10'>
             <MainView pillars={dbData.pillars} locale={locale} />
             {/* <WDisplay pillars={dbData.pillars} locale={locale} /> */}
           </div>
         </div>
         <Conclusion />
        <Donation />
      </div>
    </Layout>
  );
}

export async function getStaticProps({locale}: GetStaticPropsContext) {
   // Dynamically load the JSON file based on the selected locale
   const jsonData = (await import(`../../locales/${locale}.json`)).default;

   // Fetch MongoDB data from an API endpoint
   let dbData: DbData = { pillars: [] }; // Default fallback in case the API fails
   const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'; // .env

   try {
     const response = await axios.get<DbData>(`${apiUrl}/api/data?locale=${locale}`);
     dbData = response.data;
   } catch (error) {
     console.error('Error fetching MongoDB data:', error);
   }
   
   return {
     props: {
       dbData,
       jsonData,
       locale,
     },
   };
}