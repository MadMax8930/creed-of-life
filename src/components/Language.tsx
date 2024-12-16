import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';

export default function LanguageSelector() {
  const { locale, asPath, push } = useRouter();
  const t = useTranslations('languagesJSON');

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale !== locale) {
      // Change the locale and navigate to the same page
      push(asPath, asPath, { locale: newLocale });
    }
  };

  const languages = [
   { code: 'en', label: t('English'), flag: 'https://flagcdn.com/w320/us.png' },
   { code: 'es', label: t('Spanish'), flag: 'https://flagcdn.com/w320/es.png' },
   { code: 'fr', label: t('French'), flag: 'https://flagcdn.com/w320/fr.png' },
   { code: 'ru', label: t('Russian'), flag: 'https://flagcdn.com/w320/ru.png' },
   { code: 'th', label: t('Thai'), flag: 'https://flagcdn.com/w320/th.png' },
  ];

  return (
    <div className="flex lg:gap-3 sm:gap-2 gap-1">
      {languages.map(({ code, flag, label }) => (
        <button
          key={code}
          onClick={() => handleLocaleChange(code)}
          aria-label={label}
          title={label}
          className="language-btn"
        >
          <Image
            src={flag}
            alt={label}
            width={36}
            height={16}
            quality={100}
            className=""
            
          />
          <span className="text-xs lg:text-[10px] xl:text-[12px] font-bold lg:block hidden">{label.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}
