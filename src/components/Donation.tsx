import Link from 'next/link';
import Button from '@/components/Button';
import { FaPaypal } from 'react-icons/fa';
import { SiBuymeacoffee } from 'react-icons/si';
import { PAYPAL_URL, COFFEE_URL } from '@/types/constants'
import { useTranslations } from 'next-intl';

const Donation = () => {
   const t = useTranslations('uiJSON');

  return (
    <div className="mt-12 pt-6 mb-4 text-center w-full">
      <p className="donation-text">If you enjoyed this guide, consider supporting us:</p>
      <div className="donation-container">
        <Link href={PAYPAL_URL} passHref target="_blank" rel="noopener noreferrer">
          <Button title="Donate via PayPal" btnIcon={<FaPaypal size={16} />} additionalStyles="donation-btn hover:bg-blue-500" />
        </Link>
        <Link href={COFFEE_URL} passHref target="_blank" rel="noopener noreferrer">
          <Button title="Buy Me a Coffee" btnIcon={<SiBuymeacoffee size={16} />} additionalStyles="donation-btn hover:bg-yellow-500" />
        </Link>
      </div>
      <div className="footer-container">
        <p className="footer-light">{t('outroBloc')}</p>
        <p className="footer-bold">
          &copy; {new Date().getFullYear()} Max Surnin. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Donation;
