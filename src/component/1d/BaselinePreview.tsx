import styled from '@emotion/styled';
import type { Spectrum1D } from '@zakodium/nmrium-core';
import type { DoubleArray } from 'cheminfo-types';
import { xFindClosestIndex } from 'ml-spectra-processing';
import { useMemo, useRef, useState } from 'react';

import { isSpectrum1D } from '../../data/data1d/Spectrum1D/isSpectrum1D.ts';
import { useChartData } from '../context/ChartContext.tsx';
import { useScaleChecked } from '../context/ScaleContext.tsx';
import { Anchor } from '../elements/Anchor.tsx';
import { useActiveSpectrum } from '../hooks/useActiveSpectrum.ts';
import { useIndicatorLineColor } from '../hooks/useIndicatorLineColor.ts';
import useSpectrum from '../hooks/useSpectrum.ts';
import { PathBuilder } from '../utility/PathBuilder.ts';

interface AnchorData {
    x: number;
    id: string;
}

interface AnchorsProps {
    spectrum: Spectrum1D;
    initialAnchors: AnchorData[];
    onAnchorsChange: (anchors: AnchorData[]) => void;
}

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

function Anchors(props: AnchorsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { spectrum, initialAnchors, onAnchorsChange } = props;
    const [anchors, updateAnchors] = useState(initialAnchors);
    const { scaleX, scaleY, shiftY } = useScaleChecked();

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
    const activeSpectrum = useActiveSpectrum();

    return (
        <>
            <SpectrumPreview spectrum={spectrum} anchors={anchors} />
            <Container ref={containerRef}>
                {anchors.map((anchor) => {
                    const { x: xPPM } = anchor;
                    const x = scaleX()(xPPM);
                    const yPPM = getMedianY(xPPM, spectrum);
                    const v = shiftY * (activeSpectrum?.index || 0);
                    const y = scaleY(spectrum.id)(yPPM) - v;

                    return (
                        <Anchor
                            key={anchor.id}
                            position={{ x, y }}
                            containerRef={containerRef}
                            onDragMove={(x) => handleDragMove(anchor.id, x)}
                            onDragEnd={() => handleDragEnd(anchor.id)}
                            onDelete={() => handleDelete(anchor.id)}
                            anchorStyle={{ size: 10 }}
                        />
                    );
                })}
            </Container>
        </>
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
    const activeSpectrum = useActiveSpectrum();
    const {
        toolOptions: { selectedTool },
    } = useChartData();

    function handleGlobalChange(updated: any) {
        setGlobalAnchors(updated);
    }

    if (
        !isSpectrum1D(spectrum) ||
        selectedTool !== 'baselineCorrection' ||
        !activeSpectrum
    ) { return; }
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

function generatePreviewData(
    spectrum: Spectrum1D,
    anchors: AnchorData[],
): { x: Float64Array; y: Float64Array } {
    const { x: xValues } = spectrum.data;
    const length = xValues.length;

    const previewX = new Float64Array(xValues);
    const previewY = new Float64Array(length);

    const sorted = anchors.toSorted((a, b) => a.x - b.x);

    if (sorted.length < 2) return { x: previewX, y: previewY };

    const mappedAnchors = sorted.map((a) => ({
        index: xFindClosestIndex(xValues, a.x),
        y: getMedianY(a.x, spectrum),
    }));

    for (let p = 0; p < mappedAnchors.length - 1; p++) {
        const { index, y: fromY } = mappedAnchors[p];
        const { index: nextIndex, y: toY } = mappedAnchors[p + 1];
        const span = nextIndex - index;

        for (let i = index; i <= nextIndex; i++) {
            const t = span === 0 ? 0 : (i - index) / span;
            previewY[i] = fromY + t * (toY - fromY);
        }
    }
    return { x: previewX, y: previewY };
}

interface SpectrumPreviewProps {
    spectrum: Spectrum1D;
    anchors: AnchorData[];
}

function SpectrumPreview({ spectrum, anchors }: SpectrumPreviewProps) {
    const { scaleX, scaleY, shiftY } = useScaleChecked();
    const activeSpectrum = useActiveSpectrum();
    const indicatorColor = useIndicatorLineColor();

    const paths = useMemo(() => {
        const data = generatePreviewData(spectrum, anchors);
        const _scaleX = scaleX();
        const _scaleY = scaleY(spectrum.id);

        const pathBuilder = new PathBuilder();

        if (!data.x || !data.y || !_scaleX(0)) return '';

        const v = shiftY * (activeSpectrum?.index || 0);

        const firstX = _scaleX(data.x[0]);
        const firstY = _scaleY(data.y[0]) - v;
        pathBuilder.moveTo(firstX, firstY);

        for (let i = 1; i < data.x.length; i++) {
            const x = _scaleX(data.x[i]);
            const y = _scaleY(data.y[i]) - v;
            pathBuilder.lineTo(x, y);
        }

        return pathBuilder.toString();
    }, [spectrum, anchors, scaleX, scaleY, shiftY, activeSpectrum?.index]);
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
