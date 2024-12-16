import Layout from '@/components/Layout';
import Language from '@/components/Language';
import { GetStaticPropsContext } from 'next';

export default function Home() {

  return (
    <Layout title="Wifey Material Score">
      <div className="min-h-screen flex flex-col">
        <Language />
      </div>
    </Layout>
  );
}

export async function getStaticProps({locale}: GetStaticPropsContext) {
   // Dynamically load the JSON file based on the selected locale
   const quizData = (await import(`../../quiz/${locale}.json`)).default;
   
   return {
     props: {
       quizData,
       locale,
     },
   };
}