import Layout from '@/components/Layout';
import Language from '@/components/Language';
import Introduction from '@/components/Introduction';
import Donation from '@/components/Donation';
import MainView from '@/components/MainView';
// import WDisplay from '@/components/WDisplay';  // for v2
import Conclusion from '@/components/Conclusion';
import { GetStaticPropsContext } from 'next';
import { DbData, Pillar } from '@/types/mongo';
import { MongoClient } from 'mongodb';

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

// export async function getStaticProps({locale}: GetStaticPropsContext) {
//    // Dynamically load the JSON file based on the selected locale
//    const jsonData = (await import(`../../locales/${locale}.json`)).default;

//    // Fetch MongoDB data from an API endpoint
//    let dbData: DbData = { pillars: [] }; // Default fallback in case the API fails
//    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'; // .env

//    try {
//      const response = await axios.get<DbData>(`${apiUrl}/api/data?locale=${locale}`);
//      dbData = response.data;
//    } catch (error) {
//      console.error('Error fetching MongoDB data:', error);
//    }
   
//    return {
//      props: {
//        dbData,
//        jsonData,
//        locale,
//      },
//    };
// }

async function fetchPillarsFromMongo(): Promise<DbData> {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('DATABASE_URL is not set');
    return { pillars: [] };
  }

  let client: MongoClient | null = null;

  try {
    client = await MongoClient.connect(DATABASE_URL);
    const dbName = new URL(DATABASE_URL).pathname.substring(1);
    const db = client.db(dbName);

    const pillars = await db
      .collection('pillars')
      .aggregate<Pillar>([
        {
          $lookup: {
            from: 'branches',
            localField: 'branches',
            foreignField: '_id',
            as: 'branches',
          },
        },
        {
          $unwind: {
            path: '$branches',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'contents',
            localField: 'branches.contentItems',
            foreignField: '_id',
            as: 'branches.contentItems',
          },
        },
        {
          $group: {
            _id: '$_id',
            name: { $first: '$name' },
            order: { $first: '$order' },
            branches: { $push: '$branches' },
          },
        },
        { $sort: { order: 1 } },
      ])
      .toArray();

    const dbData: DbData = {
      pillars: pillars.map((pillar) => ({
        ...pillar,
        branches: pillar.branches.map((branch) => ({
          ...branch,
          contentItems: branch.contentItems.map((content) => ({
            ...content,
            translations: content.translations,
          })),
        })),
      })),
    };

    return dbData;
  } catch (error) {
      const err = error as Error;
      console.error('Error fetching data from MongoDB in getStaticProps:', {
      message: err.message,
      name: err.name,
      stack: err.stack,
    });
    return { pillars: [] };
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  // Ensure a safe locale for file import and for props
  const resolvedLocale = locale ?? 'en';

  // Dynamically load the JSON file based on the selected locale
  const jsonData = (await import(`../../locales/${resolvedLocale}.json`)).default;

  // Fetch MongoDB data directly (no axios / API call)
  const dbData = await fetchPillarsFromMongo();

  return {
    props: {
      dbData,
      jsonData,
      locale: resolvedLocale,
    },
  };
}