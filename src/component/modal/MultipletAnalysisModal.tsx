import { Dialog } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type { ActiveSpectrum } from '@zakodium/nmrium-core';
import { xGetFromToIndex, xyToXYObject } from 'ml-spectra-processing';
import { xreimMultipletAnalysis } from 'nmr-processing';
import { useEffect, useState } from 'react';
import { Axis, LineSeries, Plot } from 'react-plot';

import { isSpectrum2D } from '../../data/data2d/Spectrum2D/index.js';
import { useChartData } from '../context/ChartContext.js';
import { useScaleChecked } from '../context/ScaleContext.js';
import { StyledDialogBody } from '../elements/StyledDialogBody.js';

const Container = styled.div`
  padding: 10px;
  max-height: 500px;
  overflow-y: auto;
`;

const Row = styled.div`
  outline: none;
  display: flex;
  flex-direction: row;
  margin: 0;

  &:nth-child(odd) {
    background: #fafafa;
  }
`;

const Multiplicity = styled.div`
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
`;

const LoaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  user-select: none;

  svg {
    animation-name: spin-animation;
    animation-iteration-count: infinite;
    animation-fill-mode: forwards;
    animation-direction: inherit;
    animation-timing-function: linear;
    animation-duration: 1s;
    width: 100px;
    height: 100px;
  }

  @keyframes spin-animation {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
`;

interface InnerMultipleAnalysisProps {
  activeSpectrum: ActiveSpectrum | null;
  startX: any;
  endX: any;
}

interface MultipletAnalysisModalProps extends InnerMultipleAnalysisProps {
  isOpen: boolean;
  onClose: (element?: string) => void;
}

export default function MultipletAnalysisModal({
  activeSpectrum,
  startX,
  endX,
  onClose,
  isOpen,
}: MultipletAnalysisModalProps) {
  return (
    <Dialog
      isOpen={isOpen}
      style={{ width: 'auto' }}
      onClose={() => onClose()}
      title="Analyse multiplet"
    >
      <StyledDialogBody>
        <InnerMultipleAnalysis
          {...{
            activeSpectrum,
            startX,
            endX,
          }}
        />
      </StyledDialogBody>
    </Dialog>
  );
}

function InnerMultipleAnalysis(props: InnerMultipleAnalysisProps) {
  const [calcStart, setCalcStartStatus] = useState(false);
  const [isCalcFinished, setCalcFinished] = useState(false);
  const { data } = useChartData();
  const { scaleX } = useScaleChecked();

  useEffect(() => {
    setTimeout(() => {
      setCalcStartStatus(true);
    }, 400);
  }, []);

  const { activeSpectrum, startX, endX } = props;
  const [analysisData, setAnalysisData] = useState<any>();

  useEffect(() => {
    if (activeSpectrum && startX && endX && calcStart) {
      const spectrum = data[activeSpectrum.index];
      if (isSpectrum2D(spectrum)) {
        throw new Error('unreachable');
      }

      const {
        data: { x, re, im },
        info,
      } = spectrum;

      const from = scaleX().invert(startX);
      const to = scaleX().invert(endX);

      const { fromIndex, toIndex } = xGetFromToIndex(x, {
        from,
        to,
      });

      const analysesProps = {
        x: x.slice(fromIndex, toIndex),
        re: re.slice(fromIndex, toIndex),
        im: im?.slice(fromIndex, toIndex),
      };

      try {
        const result = xreimMultipletAnalysis(analysesProps, {
          autoPhase: false,
          analyzer: {
            frequency: info.originFrequency,
            minimalResolution: 0.1,
            critFoundJ: 0.75,
            maxTestedJ: 17,
            minTestedJ: 1,
            checkSymmetryFirst: false,
            takeBestPartMultiplet: true,
            correctVerticalOffset: true,
            symmetrizeEachStep: false,
            decreasingJvalues: true,
            makeShortCutForSpeed: true,
            debug: true,
          },
        });
        setCalcFinished(true);
        setAnalysisData(result);
      } catch (error) {
        // TODO: handle error
        reportError(error);
      }
    }
  }, [startX, endX, data, scaleX, activeSpectrum, calcStart]);

  if (!isCalcFinished) {
    return (
      <LoaderContainer>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 841.9 595.3">
          <g fill="#61DAFB">
            <path d="M666.3 296.5c0-32.5-40.7-63.3-103.1-82.4 14.4-63.6 8-114.2-20.2-130.4-6.5-3.8-14.1-5.6-22.4-5.6v22.3c4.6 0 8.3.9 11.4 2.6 13.6 7.8 19.5 37.5 14.9 75.7-1.1 9.4-2.9 19.3-5.1 29.4-19.6-4.8-41-8.5-63.5-10.9-13.5-18.5-27.5-35.3-41.6-50 32.6-30.3 63.2-46.9 84-46.9V78c-27.5 0-63.5 19.6-99.9 53.6-36.4-33.8-72.4-53.2-99.9-53.2v22.3c20.7 0 51.4 16.5 84 46.6-14 14.7-28 31.4-41.3 49.9-22.6 2.4-44 6.1-63.6 11-2.3-10-4-19.7-5.2-29-4.7-38.2 1.1-67.9 14.6-75.8 3-1.8 6.9-2.6 11.5-2.6V78.5c-8.4 0-16 1.8-22.6 5.6-28.1 16.2-34.4 66.7-19.9 130.1-62.2 19.2-102.7 49.9-102.7 82.3 0 32.5 40.7 63.3 103.1 82.4-14.4 63.6-8 114.2 20.2 130.4 6.5 3.8 14.1 5.6 22.5 5.6 27.5 0 63.5-19.6 99.9-53.6 36.4 33.8 72.4 53.2 99.9 53.2 8.4 0 16-1.8 22.6-5.6 28.1-16.2 34.4-66.7 19.9-130.1 62-19.1 102.5-49.9 102.5-82.3zm-130.2-66.7c-3.7 12.9-8.3 26.2-13.5 39.5-4.1-8-8.4-16-13.1-24-4.6-8-9.5-15.8-14.4-23.4 14.2 2.1 27.9 4.7 41 7.9zm-45.8 106.5c-7.8 13.5-15.8 26.3-24.1 38.2-14.9 1.3-30 2-45.2 2-15.1 0-30.2-.7-45-1.9-8.3-11.9-16.4-24.6-24.2-38-7.6-13.1-14.5-26.4-20.8-39.8 6.2-13.4 13.2-26.8 20.7-39.9 7.8-13.5 15.8-26.3 24.1-38.2 14.9-1.3 30-2 45.2-2 15.1 0 30.2.7 45 1.9 8.3 11.9 16.4 24.6 24.2 38 7.6 13.1 14.5 26.4 20.8 39.8-6.3 13.4-13.2 26.8-20.7 39.9zm32.3-13c5.4 13.4 10 26.8 13.8 39.8-13.1 3.2-26.9 5.9-41.2 8 4.9-7.7 9.8-15.6 14.4-23.7 4.6-8 8.9-16.1 13-24.1zM421.2 430c-9.3-9.6-18.6-20.3-27.8-32 9 .4 18.2.7 27.5.7 9.4 0 18.7-.2 27.8-.7-9 11.7-18.3 22.4-27.5 32zm-74.4-58.9c-14.2-2.1-27.9-4.7-41-7.9 3.7-12.9 8.3-26.2 13.5-39.5 4.1 8 8.4 16 13.1 24 4.7 8 9.5 15.8 14.4 23.4zM420.7 163c9.3 9.6 18.6 20.3 27.8 32-9-.4-18.2-.7-27.5-.7-9.4 0-18.7.2-27.8.7 9-11.7 18.3-22.4 27.5-32zm-74 58.9c-4.9 7.7-9.8 15.6-14.4 23.7-4.6 8-8.9 16-13 24-5.4-13.4-10-26.8-13.8-39.8 13.1-3.1 26.9-5.8 41.2-7.9zm-90.5 125.2c-35.4-15.1-58.3-34.9-58.3-50.6 0-15.7 22.9-35.6 58.3-50.6 8.6-3.7 18-7 27.7-10.1 5.7 19.6 13.2 40 22.5 60.9-9.2 20.8-16.6 41.1-22.2 60.6-9.9-3.1-19.3-6.5-28-10.2zM310 490c-13.6-7.8-19.5-37.5-14.9-75.7 1.1-9.4 2.9-19.3 5.1-29.4 19.6 4.8 41 8.5 63.5 10.9 13.5 18.5 27.5 35.3 41.6 50-32.6 30.3-63.2 46.9-84 46.9-4.5-.1-8.3-1-11.3-2.7zm237.2-76.2c4.7 38.2-1.1 67.9-14.6 75.8-3 1.8-6.9 2.6-11.5 2.6-20.7 0-51.4-16.5-84-46.6 14-14.7 28-31.4 41.3-49.9 22.6-2.4 44-6.1 63.6-11 2.3 10.1 4.1 19.8 5.2 29.1zm38.5-66.7c-8.6 3.7-18 7-27.7 10.1-5.7-19.6-13.2-40-22.5-60.9 9.2-20.8 16.6-41.1 22.2-60.6 9.9 3.1 19.3 6.5 28.1 10.2 35.4 15.1 58.3 34.9 58.3 50.6-.1 15.7-23 35.6-58.4 50.6zM320.8 78.4z" />
            <path d="M520.5 78.1z" />
          </g>
        </svg>
        <p>Analyse Multiplet in progress. Please wait ...</p>
      </LoaderContainer>
    );
  }

  return (
    <Container>
      {analysisData?.debug?.steps.map((d, index) => {
        return (
          // eslint-disable-next-line react/no-array-index-key
          <Row key={index}>
            <div>
              <Plot
                width={400}
                height={200}
                svgStyle={{ overflow: 'visible' }}
                seriesViewportStyle={{ stroke: 'black' }}
              >
                <LineSeries data={xyToXYObject(d.multiplet)} />
                <Axis
                  id="y"
                  position="left"
                  tickPosition="inner"
                  displayPrimaryGridLines
                  hiddenTicks
                  paddingStart={0.1}
                  paddingEnd={0.1}
                />
                <Axis
                  id="x"
                  position="bottom"
                  tickPosition="inner"
                  displayPrimaryGridLines
                />
              </Plot>
            </div>
            <Multiplicity>
              {analysisData.js[index]
                ? `${analysisData.js[index]?.multiplicity}: ${analysisData.js[
                    index
                  ]?.coupling.toFixed(3)} Hz`
                : ''}
            </Multiplicity>
            <div>
              <Plot
                width={400}
                height={200}
                seriesViewportStyle={{ stroke: 'black' }}
              >
                <LineSeries
                  data={xyToXYObject(d.errorFunction)}
                  lineStyle={{ strokeWidth: 1 }}
                />
                <Axis
                  id="y"
                  position="left"
                  tickPosition="inner"
                  displayPrimaryGridLines
                  hiddenTicks
                  paddingStart={0.1}
                  paddingEnd={0.1}
                />
                <Axis
                  id="x"
                  position="bottom"
                  tickPosition="inner"
                  displayPrimaryGridLines
                />
              </Plot>
            </div>
          </Row>
        );
      })}
    </Container>
  );
}
