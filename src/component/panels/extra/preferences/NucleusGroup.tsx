import { ReactNode } from 'react';

import IsotopesViewer from '../../../elements/IsotopesViewer';

export interface NucleusGroupProps {
  nucleus: string;
  renderTop?: () => ReactNode;
  renderBottom?: () => ReactNode;
}
interface NucleusGroupWithChildrenProps {
  nucleus: string;
  renderTop?: () => ReactNode;
  renderBottom?: () => ReactNode;
  children: ReactNode;
}

const styles = {
  groupContainer: {
    padding: '5px',
    borderRadius: '5px',
    margin: '10px 0px',
    backgroundColor: 'white',
  },
  header: {
    borderBottom: '1px solid #e8e8e8',
    paddingBottom: '5px',
    fontWeight: 'bold',
    color: '#4a4a4a',
  },
};

export function NucleusGroup({
  nucleus,
  children,
  renderTop,
  renderBottom,
}: NucleusGroupWithChildrenProps) {
  return (
    <div key={nucleus} style={styles.groupContainer}>
      <IsotopesViewer style={styles.header} value={nucleus} />
      {renderTop?.()}
      {children}
      {renderBottom?.()}
    </div>
  );
}
