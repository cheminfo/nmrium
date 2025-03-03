import type { ReactNode } from 'react';
import { ResponsiveChart } from 'react-d3-utils';

import { SVGRootContainer } from '../1d-2d/components/SVGRootContainer.js';
import { ViewerResponsiveWrapper } from '../1d-2d/components/ViewerResponsiveWrapper.js';
import BrushXY from '../1d-2d/tools/BrushXY.js';
import CrossLinePointer from '../1d-2d/tools/CrossLinePointer.js';
import { MouseTracker } from '../EventsTrackers/MouseTracker.js';
import { useChartData } from '../context/ChartContext.js';
import Spinner from '../loader/Spinner.js';
import { options } from '../toolbar/ToolTypes.js';

import { PhaseTraces } from './1d-tracer/phase-correction-traces/index.js';
import { BrushTracker2D } from './BrushTracker2D.js';
import FooterBanner from './FooterBanner.js';
import { SVGContent2D } from './SVGContent2D.js';
import SlicingView from './SlicingView.js';
import { PivotIndicator } from './tools/PivotIndicator.js';
import XYLabelPointer from './tools/XYLabelPointer.js';
import { useTracesSpectra } from './useTracesSpectra.js';
import { get2DDimensionLayout } from './utilities/DimensionLayout.js';

interface Viewer2DProps {
  emptyText?: ReactNode;
  renderSvgContentOnly?: boolean;
}

function Viewer2D(props: Viewer2DProps) {
  const { emptyText, renderSvgContentOnly = false } = props;
  const state = useChartData();
  const {
    toolOptions: { selectedTool },
    isLoading,
    data,
    margin,
  } = state;

  const spectrumData = useTracesSpectra();

  const DIMENSION = get2DDimensionLayout(state);

  if (renderSvgContentOnly) {
    return <SVGContent2D spectra={spectrumData} />;
  }

  return (
    <ResponsiveChart>
      {({ width, height }) => (
        <ViewerResponsiveWrapper width={width} height={height}>
          <Spinner isLoading={isLoading} emptyText={emptyText} />
          {data && data.length > 0 && (
            <BrushTracker2D>
              <MouseTracker
                style={{ width: '100%', height: `100%`, position: 'relative' }}
              >
                {selectedTool && selectedTool === options.slicing.id && (
                  <SlicingView />
                )}
                {selectedTool &&
                  selectedTool === options.phaseCorrectionTwoDimensions.id && (
                    <PhaseTraces />
                  )}

                <CrossLinePointer />
                <XYLabelPointer data1D={spectrumData} layout={DIMENSION} />

                <BrushXY axis="XY" dimensionBorder={DIMENSION.MAIN} />
                <>
                  {spectrumData[0] && (
                    <BrushXY
                      axis="X"
                      dimensionBorder={DIMENSION.TOP}
                      height={margin.top}
                      margin={{ ...margin, top: 0, bottom: 0 }}
                    />
                  )}
                  {spectrumData[1] && (
                    <BrushXY
                      axis="Y"
                      dimensionBorder={DIMENSION.LEFT}
                      width={margin.left}
                      margin={{ ...margin, left: 0, right: 0 }}
                    />
                  )}
                </>
                <PivotIndicator />
                <FooterBanner data1D={spectrumData} layout={DIMENSION} />
                <SVGRootContainer enableBoxBorder>
                  <SVGContent2D spectra={spectrumData} />
                </SVGRootContainer>
              </MouseTracker>
            </BrushTracker2D>
          )}
        </ViewerResponsiveWrapper>
      )}
    </ResponsiveChart>
  );
}

export default Viewer2D;
