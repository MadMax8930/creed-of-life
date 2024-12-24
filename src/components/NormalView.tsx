import { useState } from 'react';
import { Branch, Pillar, Content, MainHeroProps } from '@/types/mongo';
import { useTranslations } from 'next-intl';

const NormalView = ({ pillars, locale }: MainHeroProps) => {
  // jsonData translations of pillars and branches
  const pT = useTranslations('pillarsJSON');
  const bT = useTranslations('branchesJSON');

  // State to track selected pillar and branch
  const [selectedPillar, setSelectedPillar] = useState<Pillar | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // Handle pillar click
  const handlePillarClick = (pillar: Pillar) => {
    if (selectedPillar === pillar) {
      setSelectedPillar(null); // Collapse if already selected
    } else {
      setSelectedPillar(pillar); // Select the clicked pillar
      setSelectedBranch(null); // Reset selected branch when changing pillar
    }
  };

  // Handle branch click
  const handleBranchClick = (branch: Branch) => {
    if (selectedBranch === branch) {
      setSelectedBranch(null); // Collapse if already selected
    } else {
      setSelectedBranch(branch); // Select the clicked branch
    }
  };

  return (
    <section className="pt-10 pl-8 pr-10 pb-12">
      <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {pillars.map((pillar) => (
          <div
            key={pillar._id}
            className="p-4 bg-white rounded-lg shadow-md cursor-pointer"
            onClick={() => handlePillarClick(pillar)}
          >
            <h2 className="text-2xl font-semibold text-gray-800">
              {pT(pillar.name) || pillar.name} {/* Display the pillar name directly */}
            </h2>
            {/* Show branches if the pillar is selected */}
            {selectedPillar === pillar && (
              <ul className="mt-4 space-y-2">
                {pillar.branches.map((branch) => (
                  <li
                    key={branch._id}
                    className="p-2 bg-gray-100 rounded-md cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent pillar click event from firing
                      handleBranchClick(branch);
                    }}
                  >
                    <h3 className="text-xl font-medium text-blue-600">
                      {bT(branch.name) || branch.name} {/* Display the branch name directly */}
                    </h3>
                    {/* Show contentItems if the branch is selected */}
                    {selectedBranch === branch && (
                      <div className="mt-2 space-y-2">
                        {branch.contentItems.map((content: Content) => (
                          <div key={content._id} className="p-2 bg-gray-50 rounded-md">
                            <h4 className="text-lg font-medium text-gray-900">
                              {/* Display content title based on locale */}
                              {content.translations[locale]?.title || content.translations.en?.title || 'No Title Available'}
                            </h4>
                            <p className="text-gray-600">
                              {/* Display content text based on locale */}
                              {content.translations[locale]?.text || content.translations.en?.text || 'No Text Available'}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default NormalView;
