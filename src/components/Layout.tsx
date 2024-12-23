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
      </Head>
      <div className='min-h-screen flex flex-col items-center bg-gray-100'>
        {children}
      </div>
    </>
  );
}
