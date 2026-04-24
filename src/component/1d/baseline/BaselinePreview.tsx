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
import useSpectrum from '../../hooks/useSpectrum.ts';
import useTempSpectrum from '../../hooks/useTempSpectrum.ts';
import type { BaselineAlgorithmOptions } from '../../panels/filtersPanel/Filters/base/baselineCorrectionFields.ts';
import {
  DEFAULT_BASELINE_ALGORITHM,
  getBaselineValues,
} from '../../panels/filtersPanel/Filters/hooks/useBaselineCorrection.tsx';
import { PathBuilder } from '../../utility/PathBuilder.ts';

import { getMedianWindow } from './getMedianWindow.ts';
import { getMedianY } from './getMedianY.ts';

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
  const processedSpectrum = useSpectrum();

  const activeSpectrum = useActiveSpectrum();
  const {
    toolOptions: { selectedTool },
    width,
    margin: { left, right },
  } = useChartData();
  const indicatorColor = useIndicatorLineColor();

  const { updateFilterOptions, sharedFilterOptions } =
    useFilterSyncOptions<
      Partial<{ anchors: number[]; livePreview: boolean }>
    >();

  // Only used during active drag for local updates
  const [draggingAnchor, setDraggingAnchor] = useState<{
    index: number;
    x: number;
  } | null>(null);
  const draggingAnchorRef = useRef<{ index: number; x: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scaleX, scaleY, shiftY } = useScaleChecked();

  const anchors = useMemo(
    () =>
      (sharedFilterOptions?.anchors ?? []).map((xVal, i) =>
        draggingAnchor?.index === i ? draggingAnchor.x : xVal,
      ),
    [sharedFilterOptions?.anchors, draggingAnchor],
  );

  if (
    !isSpectrum1D(spectrum) ||
    !isSpectrum1D(processedSpectrum) ||
    selectedTool !== 'baselineCorrection' ||
    !activeSpectrum
  ) {
    return;
  }

  function handleDragMove(index: number, newX: number) {
    const clampedX = Math.max(left, Math.min(width - right, newX));
    const updated = { index, x: scaleX().invert(clampedX) };
    draggingAnchorRef.current = updated;
    setDraggingAnchor(updated);
  }

  function handleDragEnd(index: number) {
    const finalX = draggingAnchorRef.current?.x;
    draggingAnchorRef.current = null;
    setDraggingAnchor(null);
    updateFilterOptions((prev) => ({
      ...prev,
      anchors: (prev?.anchors ?? []).map((x, i) =>
        i === index ? (finalX ?? x) : x,
      ),
    }));
  }

  function handleDelete(index: number) {
    updateFilterOptions((prev) => ({
      ...prev,
      anchors: (prev?.anchors ?? []).filter((_, i) => i !== index),
    }));
  }

  return (
    <>
      <SpectrumPreview spectrum={spectrum} anchors={anchors} />
      <Container ref={containerRef}>
        {anchors.map((xPPM, index) => {
          const x = scaleX()(xPPM);
          const yPPM = getMedianY(
            xPPM,
            sharedFilterOptions?.livePreview ? processedSpectrum : spectrum,
          );
          const v = shiftY * (activeSpectrum?.index || 0);
          const y = scaleY({ spectrumId: activeSpectrum?.id })(yPPM) - v;

          return (
            <Anchor
              key={index + yPPM}
              position={{ x, y }}
              containerRef={containerRef}
              onDragMove={(x) => handleDragMove(index, x)}
              onDragEnd={() => handleDragEnd(index)}
              onDelete={() => handleDelete(index)}
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
  anchors: number[];
}

function SpectrumPreview({ spectrum, anchors }: SpectrumPreviewProps) {
  const { scaleX, scaleY, shiftY } = useScaleChecked();
  const activeSpectrum = useActiveSpectrum();
  const indicatorColor = useIndicatorLineColor();
  const { sharedFilterOptions } =
    useFilterSyncOptions<BaselineAlgorithmOptions>();

  const baselineData = useMemo(() => {
    const { x, re } = spectrum.data;

    if (
      !sharedFilterOptions ||
      anchors.length <= 1 ||
      sharedFilterOptions?.livePreview
    ) {
      return { x, y: new Float64Array(x.length) };
    }
    const medianWindow = getMedianWindow(spectrum);
    const options = {
      ...getBaselineValues(
        sharedFilterOptions?.algorithm || DEFAULT_BASELINE_ALGORITHM,
      ),
      ...sharedFilterOptions,
      anchors,
      medianWindow,
    };

    const y = xyBaselineCalculation(
      { x, y: re },
      options as BaselineCorrectionOptions,
    ) as Float64Array;
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

  if (sharedFilterOptions?.livePreview) {
    return null;
  }

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
