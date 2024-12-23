import Layout from '@/components/Layout';
import Language from '@/components/Language';
import Header from '@/components/Header';
import Donation from '@/components/Donation';
import MainHero from '@/components/MainHero';
import { GetStaticPropsContext } from 'next';

export default function Home() {

  return (
    <Layout title="Creed Of Live 101">
      <div className="min-h-screen flex flex-col">
        <Language />
        <Header />
        <MainHero />
        <Donation />
      </div>
    </Layout>
  );
}

export async function getStaticProps({locale}: GetStaticPropsContext) {
   // Dynamically load the JSON file based on the selected locale
   const mainData = (await import(`../../locales/${locale}.json`)).default;
   
   return {
     props: {
       mainData,
       locale,
     },
   };
}