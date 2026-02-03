import type { CSSProperties, RefObject } from 'react';
import { useDeferredValue, useEffect } from 'react';

import { FloatPublicationString } from '../1d/FloatPublicationString.js';
import { FloatingRanges } from '../1d/FloatingRanges.js';
import { Viewer1D } from '../1d/Viewer1D.js';
import { SpectraInsets } from '../1d/inset/SpectraInsets.js';
import { FloatMolecules } from '../1d-2d/components/FloatMoleculeStructures/FloatMolecules.js';
import { SVGRootContainer } from '../1d-2d/components/SVGRootContainer.js';
import Viewer2D from '../2d/Viewer2D.js';
import { useChartData } from '../context/ChartContext.js';
import { useExportSettings } from '../elements/export/index.js';
import { usePrintPage } from '../elements/print/index.js';
import {
  useCheckExportStatus,
  useViewportSize,
} from '../hooks/useViewportSize.js';

import type { NMRiumProps } from './NMRium.js';

interface NMRiumViewerProps {
  viewerRef: RefObject<HTMLDivElement>;
  style?: CSSProperties;
  onRender?: () => void;
  emptyText: NMRiumProps['emptyText'];
}
interface ViewerProps {
  renderSvgContentOnly?: boolean;
  emptyText: NMRiumProps['emptyText'];
}

export function NMRiumViewer(props: NMRiumViewerProps) {
  const { emptyText, viewerRef, onRender, style = {} } = props;
  const viewPort = useViewportSize();
  const { displayerMode } = useChartData();
  const exportSettings = useExportSettings();
  const printSettings = usePrintPage();

  useOnRender(onRender);

  const isExportingProcessStart = useCheckExportStatus();

  if (isExportingProcessStart && (exportSettings || printSettings)) {
    if (!exportSettings && !printSettings) {
      return <text>Print/export settings are missing.</text>;
    }

    const { width, height } = exportSettings || printSettings || {};
    let exportHeight = height;
    let exportWidth = width;

    if (exportSettings) {
      exportHeight = exportSettings.exportHeight;
      exportWidth = exportSettings.exportWidth;
    }

    return (
      <SVGRootContainer
        enableBoxBorder={displayerMode === '2D'}
        width={exportWidth}
        height={exportHeight}
        viewBox={`0 0 ${width} ${height}`}
      >
        <Viewer emptyText={emptyText} renderSvgContentOnly />
        <g className="floating-ranges">
          <FloatingRanges />
        </g>
        <g className="floating-publication-strings">
          <FloatPublicationString />
        </g>
        <g className="floating-molecules">
          <FloatMolecules />
        </g>
        <g className="spectra-insets">
          <SpectraInsets />
        </g>
      </SVGRootContainer>
    );
  }

  return (
    <div
      id="nmrium-viewer"
      data-testid="viewer"
      ref={!viewPort ? viewerRef : null}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: 'white',
        ...style,
      }}
    >
      <Viewer emptyText={emptyText} />
      <FloatingRanges />
      <FloatPublicationString />
      <SpectraInsets />
      <FloatMolecules />
    </div>
  );
}

function Viewer(props: ViewerProps) {
  const { emptyText, renderSvgContentOnly = false } = props;
  const { displayerMode } = useChartData();

  if (displayerMode === '1D') {
    return (
      <Viewer1D
        emptyText={emptyText}
        renderSvgContentOnly={renderSvgContentOnly}
      />
    );
  }

  return (
    <Viewer2D
      emptyText={emptyText}
      renderSvgContentOnly={renderSvgContentOnly}
    />
  );
}

function useOnRender(onRender: any) {
  const { width, height } = useChartData();
  const renderDimension = useDeferredValue({ width, height });

  useEffect(() => {
    function handleRenderComplete() {
      if (typeof onRender !== 'function') {
        return;
      }

      setTimeout(() => {
        if (
          renderDimension.width !== width ||
          renderDimension.height !== height
        ) {
          onRender();
        }
      }, 0);
    }

    const animationFrameId = requestAnimationFrame(handleRenderComplete);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [onRender, width, height, renderDimension.width, renderDimension.height]);
}
