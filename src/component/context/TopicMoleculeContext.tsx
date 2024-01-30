import OCL from 'openchemlib/full';
import { TopicMolecule } from 'openchemlib-utils';
import { ReactNode, createContext, useContext, useEffect, useRef } from 'react';

import { useChartData } from './ChartContext';

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
  const moleculesRef = useRef<Record<string, TopicMolecule>>({});
  const { molecules } = useChartData();

  useEffect(() => {
    for (const molecule of molecules) {
      moleculesRef.current[molecule.id] = new TopicMolecule(
        OCL.Molecule.fromMolfile(molecule.molfile),
      );
    }
  }, [molecules]);

  return (
    <TopicMoleculeContext.Provider value={moleculesRef.current}>
      {children}
    </TopicMoleculeContext.Provider>
  );
}
