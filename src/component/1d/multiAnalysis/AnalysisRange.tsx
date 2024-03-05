/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback } from 'react';

import { usePreferences } from '../../context/PreferencesContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { ResizerWithScale } from '../../elements/ResizerWithScale';
import { useHighlight } from '../../highlight';
import { useResizerStatus } from '../../hooks/useResizerStatus';

const styles = {
  common: css`
    pointer-events: bounding-box;

    @-moz-document url-prefix("") {
      pointer-events: fill;
    }
  `,
  hover: css`
    .delete-button {
      visibility: hidden;
    }
  `,
  Highlighted: css`
    .range-area {
      height: 100%;
      fill: #ff6f0057;
    }

    .delete-button {
      visibility: visible;
      cursor: pointer;
    }
  `,
};

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
          <g
            transform={`translate(0,25)`}
            css={[
              styles.common,
              highlight.isActive || isActive
                ? styles.Highlighted
                : styles.hover,
            ]}
          >
            <rect
              x="0"
              width={x2 - x1}
              height="6"
              className="range-area"
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
