import { CSSProperties, RefObject, useDeferredValue, useEffect } from 'react';

import Viewer1D from '../1d/Viewer1D';
import FloatMoleculeStructures from '../1d-2d/components/FloatMoleculeStructures';
import Viewer2D from '../2d/Viewer2D';
import { useChartData } from '../context/ChartContext';

import { NMRiumProps } from './NMRium';

interface NMRiumViewerProps {
  emptyText: NMRiumProps['emptyText'];
  viewerRef: RefObject<HTMLDivElement>;
  style?: CSSProperties;
  onRender?: () => void;
}

export function NMRiumViewer(props: NMRiumViewerProps) {
  const { emptyText, viewerRef, onRender, style = {} } = props;
  const { displayerMode, width, height } = useChartData();
  const renderDimension = useDeferredValue({ width, height });
  useEffect(() => {
    if (typeof onRender !== 'function') {
      return;
    }

    requestAnimationFrame(() => {
      setTimeout(() => {
        if (
          renderDimension.width !== width ||
          renderDimension.height !== height
        ) {
          onRender();
        }
      }, 0);
    });
  }, [onRender, width, height, renderDimension.width, renderDimension.height]);

  return (
    <div
      id="nmrium-viewer"
      data-testid="viewer"
      ref={viewerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: 'white',
        ...style,
      }}
    >
      <FloatMoleculeStructures />
      {displayerMode === '1D' ? (
        <Viewer1D emptyText={emptyText} />
      ) : (
        <Viewer2D emptyText={emptyText} />
      )}
    </div>
  );
}
