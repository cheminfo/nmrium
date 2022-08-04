/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback } from 'react';

import { useDispatch } from '../../context/DispatchContext';
import { useGlobal } from '../../context/GlobalContext';
import { useScaleChecked } from '../../context/ScaleContext';
import Resizer from '../../elements/resizer/Resizer';
import { useHighlight } from '../../highlight';
import { RESIZE_ANALYZE_SPECTRA_RANGE } from '../../reducer/types/Types';

const styles = {
  common: css`
    pointer-events: bounding-box;

    @-moz-document url-prefix() {
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
  rangeData: {
    from: number;
    to: number;
  };
}

function AnalysisRange({ rangeData, columnKey }: AnalysisRangeProps) {
  const highlight = useHighlight([columnKey], {
    type: 'MULTIPLE_ANALYSIS_ZONE',
    extra: { colKey: columnKey },
  });
  const { scaleX } = useScaleChecked();
  const dispatch = useDispatch();
  const { viewerRef } = useGlobal();

  const resizeEndHandler = useCallback(
    (resized) => {
      const { x1, x2 } = resized;
      const from = scaleX().invert(x2);
      const to = scaleX().invert(x1);

      dispatch({
        type: RESIZE_ANALYZE_SPECTRA_RANGE,
        payload: { ...rangeData, from, to, columnKey },
      });
    },
    [columnKey, dispatch, rangeData, scaleX],
  );

  const from = scaleX()(rangeData.from);
  const to = scaleX()(rangeData.to);

  return (
    <g {...highlight.onHover} {...highlight.onHover}>
      <Resizer
        tag="svg"
        onEnd={resizeEndHandler}
        initialPosition={{ x2: from, x1: to }}
        parentElement={viewerRef}
        key={`${columnKey}_${to}_${from}`}
      >
        {({ x1, x2 }, isActive) => (
          <>
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
            {/* <DeleteButton x={-20} y={10} onDelete={deleteHandler} /> */}
          </>
        )}
      </Resizer>
    </g>
  );
}

export default AnalysisRange;
