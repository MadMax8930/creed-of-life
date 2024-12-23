import { useState } from 'react';
import { Branch, Pillar, Content } from '@/types/mongo';

interface MainHeroProps {
  pillars: Pillar[];
  locale: string; // Accepting the locale prop to render dynamic translations
}

const MainHero = ({ pillars, locale }: MainHeroProps) => {
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
    <section className="p-6">
      <h1 className="text-4xl font-bold text-center mb-8">Our Core Pillars</h1>
      <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {pillars.slice(0, 3).map((pillar) => (
          <div
            key={pillar._id}
            className="p-4 bg-white rounded-lg shadow-md cursor-pointer"
            onClick={() => handlePillarClick(pillar)}
          >
            <h2 className="text-2xl font-semibold text-gray-800">
              {/* Display the pillar name */}
              {pillar.translations && pillar.translations[locale]?.name
                ? pillar.translations[locale]?.name
                : pillar.translations?.en?.name || pillar.name}
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
                      {/* Display branch name based on locale */}
                      {branch.translations && branch.translations[locale]?.name
                        ? branch.translations[locale]?.name
                        : branch.translations?.en?.name || branch.name}
                    </h3>
                    {/* Show contentItems if the branch is selected */}
                    {selectedBranch === branch && (
                      <div className="mt-2 space-y-2">
                        {branch.contentItems.map((content: Content) => (
                          <div key={content._id} className="p-2 bg-gray-50 rounded-md">
                            <h4 className="text-lg font-medium text-gray-900">
                              {/* Display content title based on locale */}
                              {content.translations && content.translations[locale]?.title
                                ? content.translations[locale]?.title
                                : content.translations?.en?.title || 'No Title Available'}
                            </h4>
                            <p className="text-gray-600">
                              {/* Display content text based on locale */}
                              {content.translations && content.translations[locale]?.text
                                ? content.translations[locale]?.text
                                : content.translations?.en?.text || 'No Description Available'}
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

export default MainHero;
