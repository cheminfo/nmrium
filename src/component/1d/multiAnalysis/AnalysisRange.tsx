/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback } from 'react';

import { useDispatch } from '../../context/DispatchContext';
import { useRootElement } from '../../context/RootContext';
import { useScaleChecked } from '../../context/ScaleContext';
import DeleteButton from '../../elements/DeleteButton';
import Resizer from '../../elements/resizer/Resizer';
import { useHighlight } from '../../highlight';
import {
  DELETE_ANALYZE_SPECTRA_RANGE,
  RESIZE_ANALYZE_SPECTRA_RANGE,
} from '../../reducer/types/Types';

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
  const highlight = useHighlight([columnKey]);
  const { scaleX } = useScaleChecked();
  const dispatch = useDispatch();
  const rootElement = useRootElement();
  const deleteHandler = useCallback(() => {
    dispatch({ type: DELETE_ANALYZE_SPECTRA_RANGE, colKey: columnKey });
  }, [columnKey, dispatch]);

  const resizeEndHandler = useCallback(
    (resized) => {
      dispatch({
        type: RESIZE_ANALYZE_SPECTRA_RANGE,
        payload: { ...rangeData, ...resized, columnKey },
      });
    },
    [columnKey, dispatch, rangeData],
  );

  const from = scaleX()(rangeData.from);
  const to = scaleX()(rangeData.to);

  return (
    <g {...highlight.onHover}>
      <Resizer
        tag="svg"
        onEnd={resizeEndHandler}
        initialPosition={{ x2: from, x1: to }}
        parentElement={rootElement}
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
            <DeleteButton x={-20} y={10} onDelete={deleteHandler} />
          </>
        )}
      </Resizer>
    </g>
  );
}

export default AnalysisRange;
