import { Molecule } from 'openchemlib';
import { TopicMolecule } from 'openchemlib-utils';
import type { ReactNode } from 'react';
import { createContext, use, useEffect, useRef } from 'react';

import { useChartData } from './ChartContext.js';

const TopicMoleculeContext = createContext<Record<string, TopicMolecule>>({});

export function useTopicMolecule() {
  const context = use(TopicMoleculeContext);

  if (!context) {
    throw new Error('Topic Molecule context was not found');
  }

  return context;
}

interface TopicMoleculeProviderProps {
  children: ReactNode;
}

export function TopicMoleculeProvider({
  children,
}: TopicMoleculeProviderProps) {
  const moleculesRef = useRef<Record<string, TopicMolecule>>({});
  const { molecules } = useChartData();

  useEffect(() => {
    for (const { id, molfile } of molecules) {
      const topicMolecule = moleculesRef.current?.[id];
      const molecule = Molecule.fromMolfile(molfile);
      if (topicMolecule) {
        moleculesRef.current[id] = topicMolecule.fromMolecule(molecule);
      } else {
        moleculesRef.current[id] = new TopicMolecule(molecule);
      }
    }
  }, [molecules]);

  return (
    <TopicMoleculeContext value={moleculesRef.current}>
      {children}
    </TopicMoleculeContext>
  );
}
