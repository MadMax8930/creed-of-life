import { useState, useEffect } from 'react';
import { Pillar, Branch, Content, HeroProps } from '@/types/mongo';
import { backgroundStyles, gradientStyles } from '@/types/constants';
import { useTranslations } from 'next-intl';
import Button from '@/components/Button';

const MainView = ({ pillars, locale }: HeroProps) => {
  const pT = useTranslations('pillarsJSON');
  const bT = useTranslations('branchesJSON');
  const sT = useTranslations('uiJSON');

  // State to track selected pillar and branch
  const [selectedPillar, setSelectedPillar] = useState<Pillar | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Handle pillar click
  const handlePillarClick = (pillar: Pillar) => {
    if (selectedPillar === pillar) {
      setSelectedPillar(null);
      setSelectedBranch(null);
    } else {
      setSelectedPillar(pillar);
      setSelectedBranch(null);
    }
  };

  // Handle branch click
  const handleBranchClick = (branch: Branch) => {
    if (selectedBranch === branch) {
      setSelectedBranch(null);
    } else {
      setSelectedBranch(branch);
    }
  };

  // Scroll to top functionality
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show "Back to Top" button when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper function to get the gradient style for the selected pillar
  const getGradientForPillar = (pillar: Pillar) => {
    const pillarIndex = pillars.findIndex((p) => p._id === pillar._id);
    return gradientStyles[pillarIndex];
  };

  return (
    <section className="pt-12 px-5 xs:px-6 sm:px-8 lg:px-12 xl:px-16">
      {/* Pillar cards displayed as buttons */}
      <div className="grid 2xl:gap-8 lg:gap-6 sm:gap-4 xs:gap-3 gap-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {pillars.map((pillar, index) => (
          <Button
            key={pillar._id}
            title={pT(pillar.name) || pillar.name}
            additionalStyles={`
               relative p-6 sm:min-h-24 min-h-20 rounded-lg shadow-md transition transform text-white
               ${backgroundStyles[index]}
               ${selectedPillar === pillar 
                  ? 'scale-105 shadow-xl opacity-100 border-2 border-secondary' 
                  : selectedPillar === null
                  ? 'opacity-100 hover:scale-105 hover:shadow-lg'
                  : 'opacity-60 hover:scale-105 hover:shadow-md'}`}
            action={() => handlePillarClick(pillar)}
          />
        ))}
      </div>

      {/* Display separator */}
      {selectedPillar && (
        <div className="separator-container">
          {`↓ ${sT('separatorInfo') || ''} ↓`}
        </div>
      )}

      {/* Display branches in a separate panel */}
      {selectedPillar && (
        <div className="sm:mt-4 mt-6 sm:space-y-3 space-y-2">
          {selectedPillar.branches.map((branch) => (
            <Button
              key={branch._id}
              title={bT(branch.name) || branch.name}
              additionalStyles={`
                 p-4 rounded-md shadow-md transition w-full font-third sm:min-h-14 min-h-16
                 ${selectedBranch === branch ? `${getGradientForPillar(selectedPillar)} text-white` : 'bg-white text-black'}
                 
              `}
              action={(e) => {
                e.stopPropagation(); // Prevent pillar click event from firing
                handleBranchClick(branch);
              }}
            />
          ))}
        </div>
      )}

      {/* Show contentItems if the branch is selected */}
      {selectedBranch && (
        <div className="mt-4 space-y-3">
          {selectedBranch.contentItems.map((content: Content) => (
            <div key={content._id} className="p-4 bg-white rounded-lg shadow-sm hover:shadow-lg">
              <h4 className="text-lg font-semibold text-gray-800">
                {content.translations[locale]?.title || content.translations.en?.title || 'No Title Available'}
              </h4>
              <p className="text-gray-600">
                {content.translations[locale]?.text || content.translations.en?.text || 'No Text Available'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Back to Top Button */}
      {showBackToTop && (
        <button onClick={scrollToTop} className="scroll-btn" aria-label="Back to Top">↑</button>
      )}
    </section>
  );
};

export default MainView;