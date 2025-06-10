import type { ReactNode } from 'react';
import { ResponsiveChart } from 'react-d3-utils';

import { SVGRootContainer } from '../1d-2d/components/SVGRootContainer.js';
import { ViewerResponsiveWrapper } from '../1d-2d/components/ViewerResponsiveWrapper.js';
import BrushXY from '../1d-2d/tools/BrushXY.js';
import CrossLinePointer from '../1d-2d/tools/CrossLinePointer.js';
import { MouseTracker } from '../EventsTrackers/MouseTracker.js';
import { useChartData } from '../context/ChartContext.js';
import { ScaleProvider } from '../context/ScaleContext.js';
import Spinner from '../loader/Spinner.js';

import { BrushTracker1D } from './BrushTracker1D.js';
import FooterBanner from './FooterBanner.js';
import { SVGContent1D } from './SVGContent1D.js';
import { PeakEditionProvider } from './peaks/PeakEditionManager.js';
import BaseLine from './tool/BaseLine.js';
import PeakPointer from './tool/PeakPointer.js';
import { PivotIndicator1D } from './tool/PivotIndicator1D.js';
import XLabelPointer from './tool/XLabelPointer.js';

interface InnerViewer1DProps {
  emptyText?: ReactNode;
}
interface Viewer1DProps extends InnerViewer1DProps {
  renderSvgContentOnly?: boolean;
}

function InnerViewer1D(props: InnerViewer1DProps) {
  const { emptyText } = props;
  const { isLoading, data } = useChartData();

  return (
    <ResponsiveChart>
      {({ height, width }) => (
        <ViewerResponsiveWrapper height={height} width={width}>
          <div style={{ height: '100%', position: 'relative' }}>
            <Spinner isLoading={isLoading} emptyText={emptyText} />

            {data && data.length > 0 && (
              <BrushTracker1D>
                <MouseTracker
                  style={{
                    width: '100%',
                    height: `100%`,
                    position: 'absolute',
                  }}
                >
                  <CrossLinePointer />
                  <BrushXY axis="XY" enableHorizontalGuideline />
                  <XLabelPointer />
                  <PeakPointer />
                  <FooterBanner />
                  <PeakEditionProvider>
                    <SVGRootContainer>
                      <SVGContent1D />
                    </SVGRootContainer>
                  </PeakEditionProvider>
                  <BaseLine />
                  <PivotIndicator1D />
                </MouseTracker>
              </BrushTracker1D>
            )}
          </div>
        </ViewerResponsiveWrapper>
      )}
    </ResponsiveChart>
  );
}

export function Viewer1D(props: Viewer1DProps) {
  const { renderSvgContentOnly = false, ...otherProps } = props;

  if (renderSvgContentOnly) {
    return (
      <ScaleProvider>
        <SVGContent1D />
      </ScaleProvider>
    );
  }

  return (
    <ScaleProvider>
      <InnerViewer1D {...otherProps} />
    </ScaleProvider>
  );
}
