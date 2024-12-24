import { useState } from 'react';
import { Pillar, Branch, Content, HeroProps } from '@/types/mongo';
import { useTranslations } from 'next-intl';
import Button from '@/components/Button';

const MainView = ({ pillars, locale }: HeroProps) => {
  const pT = useTranslations('pillarsJSON');
  const bT = useTranslations('branchesJSON');

  // State to track selected pillar and branch
  const [selectedPillar, setSelectedPillar] = useState<Pillar | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

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

  return (
    <section className="pt-12 px-4 sm:px-6 md:px-8 lg:px-16 bg-gradient-to-r from-blue-200 via-blue-100 to-white">
      {/* Pillar cards displayed as buttons */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {pillars.map((pillar) => (
          <Button
            key={pillar._id}
            title={pT(pillar.name) || pillar.name}
            additionalStyles={`p-6 rounded-lg shadow-lg transition transform 
              ${selectedPillar === pillar ? 'bg-blue-500 text-white' : 'bg-white'}`}
            action={() => handlePillarClick(pillar)}
          />
        ))}
      </div>

      {/* Display branches in a separate panel */}
      {selectedPillar && (
        <div className="mt-8 space-y-4">
          {selectedPillar.branches.map((branch) => (
            <Button
              key={branch._id}
              title={bT(branch.name) || branch.name}
              additionalStyles={`p-4 rounded-md shadow-md transition w-full
                ${selectedBranch === branch ? 'bg-teal-400 text-white' : 'bg-teal-100'}`}
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
    </section>
  );
};

export default MainView;