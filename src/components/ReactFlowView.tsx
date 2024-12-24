import React from 'react';
import ReactFlow, { Background, Controls, MiniMap, BackgroundVariant } from 'reactflow';
import { DbData } from '@/types/mongo';
import 'reactflow/dist/style.css';

const ReactFlowView = ({ pillars }: DbData) => {
   // Convert pillars and branches into React Flow nodes and edges
   const nodes = pillars.map((pillar, index) => ({
     id: `pillar-${pillar._id}`,
     position: { x: index * 300, y: 0 },
     data: { label: pillar.name },
     style: {
       background: '#1f2937',
       color: 'white',
       border: '2px solid #4b5563',
       borderRadius: '5px',
     },
   }));
 
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
 
   // Add branch nodes to the graph
   const branchNodes = pillars.flatMap((pillar, index) =>
     pillar.branches.map((branch, branchIndex) => ({
       id: `branch-${branch._id}`,
       position: { x: index * 300, y: 150 + branchIndex * 150 },
       data: { label: branch.name },
       style: {
         background: '#4b5563',
         color: 'white',
         border: '2px solid #9ca3af',
         borderRadius: '5px',
       },
     }))
   );
 
   return (
     <div style={{ height: '70vh', background: '#1f2937' }}>
       <ReactFlow
         nodes={[...nodes, ...branchNodes]}
         edges={edges}
         fitView
         style={{ background: '#1a1a2e' }}
       >
         <MiniMap />
         <Controls />
         <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#4b5563" />
       </ReactFlow>
     </div>
   );
};

export default ReactFlowView;
 