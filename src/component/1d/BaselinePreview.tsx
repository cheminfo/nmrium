import styled from '@emotion/styled';
import type { Spectrum1D } from '@zakodium/nmrium-core';
import type { DoubleArray } from 'cheminfo-types';
import { xFindClosestIndex } from 'ml-spectra-processing';
import { useRef, useState } from 'react';

import { isSpectrum1D } from '../../data/data1d/Spectrum1D/isSpectrum1D.ts';
import { useChartData } from '../context/ChartContext.tsx';
import { useScaleChecked } from '../context/ScaleContext.tsx';
import { Anchor } from '../elements/Anchor.tsx';
import useSpectrum from '../hooks/useSpectrum.ts';

interface AnchorData {
  x: number;
  id: string;
}

interface AnchorsProps {
  spectrum: Spectrum1D;
  initialAnchors: AnchorData[];
  onAnchorsChange: (anchors: AnchorData[]) => void;
}

const Container = styled.div`
  position: absolute;
  width: 100%;
  left: 0;
  top: 0;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
`;

function Anchors(props: AnchorsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { spectrum, initialAnchors, onAnchorsChange } = props;
  const [anchors, updateAnchors] = useState(initialAnchors);
  const { scaleX, scaleY } = useScaleChecked();

  function handleDragMove(id: string, newX: number) {
    updateAnchors((prev) =>
      prev.map((a) => (a.id === id ? { ...a, x: scaleX().invert(newX) } : a)),
    );
  }

  function handleDragEnd(id: string) {
    updateAnchors((prev) => {
      const next = prev.map((a) => {
        if (a.id !== id) return a;
        return a;
      });
      onAnchorsChange(next);
      return next;
    });
  }

  function handleDelete(id: string) {
    updateAnchors((prev) => {
      const next = prev.filter((a) => a.id !== id);
      onAnchorsChange(next);
      return next;
    });
  }

  return (
    <Container ref={containerRef}>
      {anchors.map((anchor) => {
        const { x: xPPM } = anchor;
        const x = scaleX()(xPPM);
        const yPPM = getMedianY(xPPM, spectrum);
        const y = scaleY(spectrum.id)(yPPM);

        return (
          <Anchor
            key={anchor.id}
            position={{ x, y }}
            containerRef={containerRef}
            onDragMove={(x) => handleDragMove(anchor.id, x)}
            onDragEnd={() => handleDragEnd(anchor.id)}
            onDelete={() => handleDelete(anchor.id)}
          />
        );
      })}
    </Container>
  );
}

const INITIAL_ANCHORS = [
  {
    id: 'a1',
    x: 1,
  },
  { id: 'a2', x: 5 },
  { id: 'a3', x: 8 },
  { id: 'a4', x: 7 },
];

export function BaselinePreview() {
  const [globalAnchors, setGlobalAnchors] = useState(INITIAL_ANCHORS);
  const spectrum = useSpectrum();
  const {
    toolOptions: { selectedTool },
  } = useChartData();

  function handleGlobalChange(updated: any) {
    setGlobalAnchors(updated);
  }

  if (!isSpectrum1D(spectrum) || selectedTool !== 'baselineCorrection') return;
  /**
   *  TODO: Apply the baseline correction on the fly and pass the anchors along with the newly processed spectrum,
   *  where the y-value of each anchor is also calculated on the fly.
   *  This removes the need to store the y-value in the filter anchors.
   *  Preview the spectrum after applying the baseline correction method
   */

  return (
    <Anchors
      spectrum={spectrum}
      initialAnchors={globalAnchors}
      onAnchorsChange={handleGlobalChange}
    />
  );
}

function getMedianY(x: number, spectrum: Spectrum1D, windowSize = 20): number {
  const { x: xValues, re: yValues } = spectrum.data;

  const centerIndex = xFindClosestIndex(xValues, x);
  const halfWindow = Math.floor(windowSize / 2);

  const fromIndex = Math.max(0, centerIndex - halfWindow);
  const toIndex = Math.min(xValues.length, centerIndex + halfWindow + 1);

  const yWindow = yValues.slice(fromIndex, toIndex);

  if (yWindow.length === 0) return 0;

  return getMedian(yWindow);
}

function getMedian(values: DoubleArray): number {
  const sorted = values.toSorted((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const isOdd = sorted.length % 2 !== 0;

  if (isOdd) {
    return sorted[mid];
  }

  return (sorted[mid - 1] + sorted[mid]) / 2;
}
