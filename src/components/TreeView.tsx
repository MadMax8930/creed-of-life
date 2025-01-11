import React, { useState } from 'react';
import ReactFlow, { Background, Controls, BackgroundVariant } from 'reactflow';
import { Pillar, Branch, Content, HeroProps } from '@/types/mongo';
import { useTranslations } from 'next-intl';
import 'reactflow/dist/style.css';

// for V2
const TreeView = ({ pillars, locale }: HeroProps) => {
  const pT = useTranslations('pillarsJSON'); // Pillar translations
  const bT = useTranslations('branchesJSON'); // Branch translations

  // State to track selected pillar, branch, and content
  const [selectedPillar, setSelectedPillar] = useState<Pillar | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);

  // Handle pillar click (initial chose)
  const handlePillarClick = (pillar: Pillar) => {
    if (selectedPillar === pillar) {
      setSelectedPillar(null); // Collapse if already selected
    } else {
      setSelectedPillar(pillar); // Select the clicked pillar
      setSelectedBranch(null); // Reset selected branch when changing pillar
      setSelectedContent(null); // Reset content when changing pillar
    }
  };

  // Handle branch click (pillar already clicked, second chose)
  const handleBranchClick = (branch: Branch) => {
    if (selectedBranch === branch) {
      setSelectedBranch(null); // Collapse if already selected
    } else {
      setSelectedBranch(branch); // Select the clicked branch
      setSelectedContent(null); // Reset content when changing branch
    }
  };

  // Handle content click (pillar and branch clicked, third chose)
  const handleContentClick = (content: Content) => {
    if (selectedContent === content) {
      setSelectedContent(null); // Deselect content if already selected
    } else {
      setSelectedContent(content); // Select content to show popup
    }
  };

  // Convert pillars and branches into React Flow nodes and edges with translations
  const nodes = pillars.map((pillar, index) => ({
    id: `pillar-${pillar._id}`,
    position: { x: index * 300, y: 0 },
    data: { label: pT(pillar.name) || pillar.name },
    style: {
      background: '#1f2937',
      color: 'white',
      border: '2px solid #4b5563',
      borderRadius: '5px',
      cursor: 'pointer',
    },
  }));

  const branchNodes = pillars.flatMap((pillar, index) =>
    pillar.branches.map((branch, branchIndex) => ({
      id: `branch-${branch._id}`,
      position: { x: index * 300, y: 150 + branchIndex * 150 },
      data: { label: bT(branch.name) || branch.name },
      style: {
        background: '#4b5563',
        color: 'white',
        border: '2px solid #9ca3af',
        borderRadius: '5px',
        cursor: 'pointer',
      },
    }))
  );

  const edges = pillars.flatMap((pillar) =>
    pillar.branches.map((branch) => ({
      id: `edge-${pillar._id}-${branch._id}`,
      source: `pillar-${pillar._id}`,
      target: `branch-${branch._id}`,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#60a5fa', strokeWidth: 2 },
    }))
  );

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <ReactFlow
        nodes={[...nodes, ...branchNodes]}
        edges={edges}
        fitView
        style={{ background: 'transparent', width: '80vw', height: '80vh' }}
        onNodeClick={(event, node) => {
          if (node.id.startsWith('pillar-')) {
            const pillarId = node.id.split('-')[1];
            const clickedPillar = pillars.find((pillar) => pillar._id === pillarId);
            handlePillarClick(clickedPillar!);
          } else if (node.id.startsWith('branch-')) {
            const branchId = node.id.split('-')[1];
            const clickedBranch = pillars
              .flatMap((pillar) => pillar.branches)
              .find((branch) => branch._id === branchId);
            handleBranchClick(clickedBranch!);
          }
        }}
        nodesDraggable={false}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#4b5563" />
      </ReactFlow>

      {selectedBranch && (
        <div
          style={{
            position: 'fixed',
            top: '10%',
            left: '50%',
            transform: 'translate(-50%, -10%)',
            background: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
            zIndex: 1000,
            maxWidth: '90vw',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <button
            style={{ position: 'absolute', top: '10px', right: '10px' }}
            onClick={() => setSelectedBranch(null)}
          >
            Close
          </button>
          <h3 style={{ color: '#333' }}>
            {bT(selectedBranch.name) || selectedBranch.name}
          </h3>
          <div style={{ marginTop: '10px' }}>
            {selectedBranch.contentItems.map((content: Content) => (
              <div
                key={content._id}
                style={{
                  marginBottom: '10px',
                  height: 'auto',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => handleContentClick(content)}
              >
                <h4
                  style={{
                    color: '#555',
                    fontSize: '1.2rem',
                    lineHeight: '1.5',
                  }}
                >
                  {content.translations[locale]?.title || content.translations.en?.title || 'No Title Available'}
                </h4>
                <p style={{ color: '#777', fontSize: '1rem' }}>
                  {content.translations[locale]?.text || content.translations.en?.text || 'No Text Available'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedContent && (
        <div
          style={{
            position: 'fixed',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -20%)',
            background: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
            zIndex: 1001,
            maxWidth: '80vw',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <button
            style={{ position: 'absolute', top: '10px', right: '10px' }}
            onClick={() => setSelectedContent(null)}
          >
            Close
          </button>
          <h4 style={{ color: '#333' }}>
            {selectedContent.translations[locale]?.title || selectedContent.translations.en?.title || 'No Title Available'}
          </h4>
          <p style={{ color: '#777' }}>
            {selectedContent.translations[locale]?.text || selectedContent.translations.en?.text || 'No Text Available'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TreeView;
