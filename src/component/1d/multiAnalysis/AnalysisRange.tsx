import styled from '@emotion/styled';
import { useCallback } from 'react';

import { usePreferences } from '../../context/PreferencesContext.js';
import { useScaleChecked } from '../../context/ScaleContext.js';
import { ResizerWithScale } from '../../elements/ResizerWithScale.js';
import { useHighlight } from '../../highlight/index.js';
import { useResizerStatus } from '../../hooks/useResizerStatus.js';

const Rect = styled.rect<{ isActive: boolean }>`
  height: ${({ isActive }) => (isActive ? '100%' : '6px')};
  fill: ${({ isActive }) => (isActive ? '#ff6f0057' : 'green')};
`;

interface AnalysisRangeProps {
  columnKey: string;
  activeTab: string;
  rangeData: {
    from: number;
    to: number;
  };
}

function AnalysisRange({
  rangeData,
  columnKey,
  activeTab,
}: AnalysisRangeProps) {
  const highlight = useHighlight([columnKey], {
    type: 'MULTIPLE_ANALYSIS_ZONE',
    extra: { colKey: columnKey },
  });
  const { scaleX } = useScaleChecked();
  const { dispatch } = usePreferences();

  const resizeEndHandler = useCallback(
    (resized) => {
      const { x1, x2 } = resized;
      const start = scaleX().invert(x2);
      const end = scaleX().invert(x1);

      dispatch({
        type: 'ANALYZE_SPECTRA',
        payload: { start, end, columnKey, nucleus: activeTab },
      });
    },
    [activeTab, columnKey, dispatch, scaleX],
  );

  const { from, to } = rangeData;
  const isResizingActive = useResizerStatus('multipleSpectraAnalysis');
  return (
    <g {...highlight.onHover} {...highlight.onHover}>
      <ResizerWithScale
        onEnd={resizeEndHandler}
        from={from}
        to={to}
        disabled={!isResizingActive}
      >
        {({ x1, x2 }, isActive) => (
          <g transform={`translate(0,25)`}>
            <Rect
              isActive={highlight.isActive || isActive}
              x="0"
              width={x2 - x1}
              height="6"
              fill="green"
            />
            <text
              textAnchor="middle"
              x={(x2 - x1) / 2}
              y="-5"
              fontSize="12"
              fill="red"
              fontWeight="bolder"
              fillOpacity={highlight.isActive ? 1 : 0.6}
            >
              {columnKey}
            </text>
          </g>
        )}
      </ResizerWithScale>
    </g>
  );
}

export default AnalysisRange;
