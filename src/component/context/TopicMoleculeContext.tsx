import OCL from 'openchemlib/full';
import { TopicMolecule } from 'openchemlib-utils';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo } from 'react';

import { useChartData } from './ChartContext.js';

const TopicMoleculeContext = createContext<Record<string, TopicMolecule>>({});

export function useTopicMolecule() {
  const context = useContext(TopicMoleculeContext);

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
  const topicMolecules = useMemo<Record<string, TopicMolecule>>(() => ({}), []);
  const { molecules } = useChartData();

  useEffect(() => {
    for (const { id, molfile } of molecules) {
      const topicMolecule = topicMolecules.current?.[id];
      const molecule = OCL.Molecule.fromMolfile(molfile);
      if (topicMolecule) {
        topicMolecules.current[id] = topicMolecule.fromMolecule(molecule);
      } else {
        topicMolecules.current[id] = new TopicMolecule(molecule);
      }
    }
  }, [topicMolecules, molecules]);

  return (
    <TopicMoleculeContext.Provider value={topicMolecules}>
      {children}
    </TopicMoleculeContext.Provider>
  );
}
