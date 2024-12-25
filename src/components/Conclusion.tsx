import { useTranslations } from 'next-intl';

const Conclusion = () => {
  const t = useTranslations('uiJSON');
  
  return (
    <section className="bg-primary pt-10 pb-12 px-4 sm:px-12">
      <div className="max-w-7xl mx-auto text-left px-2">
        <h2 className="conclusion-title">
          {t('concTitle')}
        </h2>
        <p className="conclusion-text">
          {t('concText')}
        </p>
      </div>
    </section>
  );
};

export default Conclusion;