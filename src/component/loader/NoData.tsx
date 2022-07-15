import { CSSProperties, ReactNode } from 'react';

import { useLoader } from '../context/LoaderContext';
import { useCheckToolsVisibility } from '../hooks/useCheckToolsVisibility';

const styles: Record<'container' | 'text', CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ' rgba(255, 255, 255, 0.25)',
    flexDirection: 'column',
    userSelect: 'none',
    width: '100%',
    height: '100%',
    outline: '10px dashed rgba(0, 0, 0, 0.3)',
    outlineOffset: -'10px',
    paddingLeft: '20px',
    paddingRight: '20px',
  },
  text: {
    padding: '15px 30px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '39px',
    color: 'white',
    fontSize: 'x-large',
    fontWeight: 'bold',
  },
};

interface NoDataProps {
  isEmpty?: boolean;
  canOpenLoader?: boolean;
  emptyText?: ReactNode;
  style?: CSSProperties;
}

function NoData({
  isEmpty = true,
  emptyText = 'Drag and drop here a JCAMP-DX, zipped Bruker folder, Jeol jdf or NMRium file',
  canOpenLoader = true,
  style,
}: NoDataProps) {
  const openLoader = useLoader();
  const isToolEnabled = useCheckToolsVisibility();

  if (!isEmpty) {
    return null;
  }

  return (
    <div
      style={{ ...styles.container, ...style }}
      {...(canOpenLoader && { onClick: openLoader })}
    >
      <p style={styles.text}>
        {isToolEnabled('import')
          ? emptyText
          : 'Importation feature has been disabled'}
      </p>
    </div>
  );
}

export default NoData;
