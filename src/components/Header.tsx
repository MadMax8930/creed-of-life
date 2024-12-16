import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const TypingEffect = ({ textKey, style }: { textKey: string; style: string }) => {
  const t = useTranslations('uiJSON');
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

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

const Header = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-8 space-y-1 w-full">
      <TypingEffect textKey="quizTitle" style="font-1 sm:text-2xl text-lg" />
      <TypingEffect textKey="quizSubtitle" style="font-2 sm:text-xl text-lg" />
    </div>
  );
};

export default Header;