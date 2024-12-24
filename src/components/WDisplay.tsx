import { useState } from 'react';
import { HeroProps } from '@/types/mongo';
import MainView from '@/components/MainView';
import TreeView from '@/components/TreeView';
import Button from '@/components/Button';

const WDisplay = ({ pillars, locale }: HeroProps) => {
   
  const [isChartView, setIsChartView] = useState(false);
  const toggleView = () => setIsChartView(!isChartView);

  return (
    <div className="pt-10 px-8 pb-12">
      {/* View Toggle Button */}
      <Button
        title={isChartView ? 'Switch to Normal View' : 'Switch to Chart View'}
        btnType="button"
        additionalStyles="mb-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md"
        textStyles="text-base font-medium"
        action={toggleView}
      />
      {/* Conditional Rendering for Views */}
      {isChartView ? (
        <TreeView pillars={pillars} locale={locale} />
      ) : (
        <MainView pillars={pillars} locale={locale} />
      )}
    </div>
  );
};

export default WDisplay;