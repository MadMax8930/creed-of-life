import { useState } from 'react';
import { MainHeroProps } from '@/types/mongo';
import NormalView from '@/components/NormalView';
import ReactFlowView from '@/components/ReactFlowView';

const MainHero = ({ pillars, locale }: MainHeroProps) => {
  const [isChartView, setIsChartView] = useState(false); // Toggle between views

  // Toggle view
  const toggleView = () => setIsChartView(!isChartView);

  return (
    <div className="pt-10 pl-8 pr-10 pb-12">
      {/* View Toggle Button */}
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
        onClick={toggleView}
      >
        {isChartView ? 'Switch to Normal View' : 'Switch to Chart View'}
      </button>

      {isChartView ? (
        <ReactFlowView pillars={pillars} />
      ) : (
        <NormalView pillars={pillars} locale={locale} />
      )}
    </div>
  );
};

export default MainHero;