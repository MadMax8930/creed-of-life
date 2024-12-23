import Layout from '@/components/Layout';
import Language from '@/components/Language';
import Header from '@/components/Header';
import Donation from '@/components/Donation';
import MainHero from '@/components/MainHero';
import Conclusion from '@/components/Conclusion';
import { GetStaticPropsContext } from 'next';
import { DbData } from '@/types/mongo';
import axios from 'axios';

export default function Home({ dbData, locale }: { dbData: DbData, locale: string }) {

  return (
    <Layout title="Creed Of Live 101">
      <div className="min-h-screen flex flex-col">
        <Language />
        <Header />
        <MainHero pillars={dbData.pillars} locale={locale} />
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
   try {
     const response = await axios.get<DbData>(`${process.env.NEXT_PUBLIC_API_URL}/api/data?locale=${locale}`);
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