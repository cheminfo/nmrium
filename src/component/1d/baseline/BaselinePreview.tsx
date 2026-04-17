import styled from '@emotion/styled';
import type { BaselineCorrectionOptions } from '@zakodium/nmr-types';
import type { Spectrum1D } from '@zakodium/nmrium-core';
import { xyBaselineCalculation } from 'nmr-processing';
import { useMemo, useRef, useState } from 'react';

import { isSpectrum1D } from '../../../data/data1d/Spectrum1D/isSpectrum1D.ts';
import { useChartData } from '../../context/ChartContext.tsx';
import { useFilterSyncOptions } from '../../context/FilterSyncOptionsContext.tsx';
import { useScaleChecked } from '../../context/ScaleContext.tsx';
import { Anchor } from '../../elements/Anchor.tsx';
import { useActiveSpectrum } from '../../hooks/useActiveSpectrum.ts';
import { useIndicatorLineColor } from '../../hooks/useIndicatorLineColor.ts';
import useTempSpectrum from '../../hooks/useTempSpectrum.ts';
import { getBaselineValues } from '../../panels/filtersPanel/Filters/hooks/useBaselineCorrection.tsx';
import { PathBuilder } from '../../utility/PathBuilder.ts';

import { getMedianY } from './getMedianY.ts';
import type { AnchorData } from './mapAnchors.ts';
import { mapAnchors } from './mapAnchors.ts';

const SVGWrapper = styled.svg`
  position: absolute;
  width: 100%;
  left: 0;
  top: 0;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
`;

const Container = styled.div`
  position: absolute;
  width: 100%;
  left: 0;
  top: 0;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
`;

export function BaselinePreview() {
  // const spectrum = useSpectrum();
  const spectrum = useTempSpectrum();

  const activeSpectrum = useActiveSpectrum();
  const {
    toolOptions: { selectedTool },
    width,
    margin: { left, right },
  } = useChartData();
  const indicatorColor = useIndicatorLineColor();

  const { updateFilterOptions, sharedFilterOptions } =
    useFilterSyncOptions<
      Partial<{ anchors: Array<{ id: string; x: number }> }>
    >();

  // Only used during active drag for local updates
  const [draggingAnchor, setDraggingAnchor] = useState<{
    id: string;
    x: number;
  } | null>(null);
  const draggingAnchorRef = useRef<{ id: string; x: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scaleX, scaleY, shiftY } = useScaleChecked();

  const anchors = useMemo(
    () =>
      (sharedFilterOptions?.anchors ?? []).map((a) =>
        draggingAnchor?.id === a.id ? { ...a, x: draggingAnchor.x } : a,
      ),
    [sharedFilterOptions?.anchors, draggingAnchor],
  );

  if (
    !isSpectrum1D(spectrum) ||
    selectedTool !== 'baselineCorrection' ||
    !activeSpectrum
  ) {
    return;
  }

  function handleDragMove(id: string, newX: number) {
    const leftEdge = left;
    const rightEdge = width - right;

    const clampedX = Math.max(leftEdge, Math.min(rightEdge, newX));
    const updated = { id, x: scaleX().invert(clampedX) };
    draggingAnchorRef.current = updated;
    setDraggingAnchor(updated);
  }

  function handleDragEnd(id: string) {
    const finalX = draggingAnchorRef.current?.x;
    draggingAnchorRef.current = null;
    setDraggingAnchor(null);
    updateFilterOptions((prev) => {
      const anchors = (prev?.anchors ?? []).map((a) =>
        a.id === id ? { ...a, x: finalX ?? a.x } : a,
      );
      return { ...prev, anchors };
    });
  }

  function handleDelete(id: string) {
    updateFilterOptions((prev) => {
      const anchors = (prev?.anchors || []).filter((a) => a.id !== id);
      return {
        ...prev,
        anchors,
      };
    });
  }

  return (
    <>
      <SpectrumPreview spectrum={spectrum} anchors={anchors} />
      <Container ref={containerRef}>
        {anchors.map((anchor) => {
          const { x: xPPM } = anchor;
          const x = scaleX()(xPPM);
          const yPPM = getMedianY(xPPM, spectrum);
          const v = shiftY * (activeSpectrum?.index || 0);
          const y = scaleY({ spectrumId: activeSpectrum?.id })(yPPM) - v;

          return (
            <Anchor
              key={anchor.id}
              position={{ x, y }}
              containerRef={containerRef}
              onDragMove={(x) => handleDragMove(anchor.id, x)}
              onDragEnd={() => handleDragEnd(anchor.id)}
              onDelete={() => handleDelete(anchor.id)}
              anchorStyle={{
                size: 10,
                hoverStroke: 'red',
                dragStroke: 'darkgreen',
                guideColor: 'red',
                guideDragColor: 'darkgreen',
                stroke: indicatorColor,
              }}
            />
          );
        })}
      </Container>
    </>
  );
}

interface SpectrumPreviewProps {
  spectrum: Spectrum1D;
  anchors: AnchorData[];
}

function SpectrumPreview({ spectrum, anchors }: SpectrumPreviewProps) {
  const { scaleX, scaleY, shiftY } = useScaleChecked();
  const activeSpectrum = useActiveSpectrum();
  const indicatorColor = useIndicatorLineColor();
  const { sharedFilterOptions } =
    useFilterSyncOptions<BaselineCorrectionOptions>();

  const baselineData = useMemo(() => {
    const { x, re } = spectrum.data;

    if (!sharedFilterOptions || anchors.length <= 1) {
      return { x, y: new Float64Array(x.length) };
    }

    const options = {
      ...getBaselineValues(sharedFilterOptions?.algorithm || 'polynomial'),
      ...sharedFilterOptions,
      anchors: mapAnchors(spectrum, anchors),
    };

    const y = xyBaselineCalculation({ x, y: re }, options) as Float64Array;
    return { x, y };
  }, [anchors, sharedFilterOptions, spectrum]);

  const paths = useMemo(() => {
    const { x, y } = baselineData;

    const _scaleX = scaleX();
    const _scaleY = scaleY({ spectrumId: activeSpectrum?.id });

    const pathBuilder = new PathBuilder();

    if (!x || !y || !_scaleX(0)) return '';

    const v = shiftY * (activeSpectrum?.index || 0);

    const firstX = _scaleX(x[0]);
    const firstY = _scaleY(y[0]) - v;
    pathBuilder.moveTo(firstX, firstY);

    for (let i = 1; i < x.length; i++) {
      const px = _scaleX(x[i]);
      const py = _scaleY(y[i]) - v;
      pathBuilder.lineTo(px, py);
    }

    return pathBuilder.toString();
  }, [
    baselineData,
    scaleX,
    scaleY,
    activeSpectrum?.id,
    activeSpectrum?.index,
    shiftY,
  ]);
  return (
    <SVGWrapper>
      <path
        className="baseline-preview-line"
        data-testid="baseline-preview-line"
        stroke={indicatorColor}
        fill="none"
        d={paths}
      />
    </SVGWrapper>
  );
}
