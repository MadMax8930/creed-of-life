import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const TypingEffect = ({ textKey, style }: { textKey: string; style: string }) => {
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
   
  const t = useTranslations('uiJSON');
  const text = t(textKey); // Get the full translated text

  useEffect(() => {
    let index = 0;

    setTypedText(''); // Clear typed text on language change
    setIsTyping(true); // Reset typing state

    const type = () => {
      if (index <= text.length) {
        setTypedText(text.slice(0, index)); // Show up to the current index
        index++; // Move to the next character
      } else {
        setIsTyping(false); // Typing is finished
        clearInterval(intervalId); // Stop interval
      }
    };

    const intervalId = setInterval(type, 100); // Assign interval after defining 'type'
    type(); // Start immediately after setting up interval
  
    return () => clearInterval(intervalId); // Cleanup when text changes
  }, [text]);

  return (
    <p className={`${style} text-center`}>
      {typedText}
      <span className={`header-cursor ${isTyping ? 'blinking' : ''}`}>▮</span>
    </p>
  );
};

const Introduction = () => {
   const t = useTranslations('uiJSON');

  return (
    <div className="intro-container">
      <div className="intro-text-wrapper">
        <TypingEffect textKey="mainTitle" style="main-title" />
        <TypingEffect textKey="mainSubtitle" style="main-subtitle" />
      </div>
      <div className="intro-bloc-wrapper">
        <p className="intro-bloc-content">
          {t('introBloc')}
        </p>
      </div>
    </div>
  );
};

export default Introduction;