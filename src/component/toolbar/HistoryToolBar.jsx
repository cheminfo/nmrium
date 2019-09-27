import React, { Fragment, useCallback, memo } from 'react';
import { FaUndo, FaRedo } from 'react-icons/fa';

import { useDispatch } from '../context/DispatchContext';
import { REDO, UNDO } from '../reducer/HistoryActions';
import { ChartContext, useChartData } from '../context/ChartContext';
import ToolTip from '../elements/ToolTip/ToolTip';

const styles = {
  button: {
    backgroundColor: 'transparent',
    border: 'none',
    width: '35px',
    height: '35px',
  },
};

const HistoryToolBar = ({
  isUndoButtonVisible = true,
  isRedoButtonVisible = true,
}) => {
  const { history } = useChartData(ChartContext);

  const dispatch = useDispatch();
  const handleRedo = useCallback(
    () =>
      dispatch({
        type: REDO,
      }),
    [dispatch],
  );
  const handleUndo = useCallback(
    () =>
      dispatch({
        type: UNDO,
      }),
    [dispatch],
  );

  return (
    <Fragment>
      {isUndoButtonVisible && (
        <ToolTip title="Redo" popupPlacement="right">
          <button
            style={styles.button}
            type="button"
            onClick={handleRedo}
            disabled={!history.hasRedo}
          >
            <FaRedo />
          </button>
        </ToolTip>
      )}
      {isRedoButtonVisible && (
        <ToolTip title="Undo" popupPlacement="right">
          <button
            type="button"
            style={styles.button}
            onClick={handleUndo}
            disabled={!history.hasUndo}
          >
            <FaUndo />
          </button>
        </ToolTip>
      )}
    </Fragment>
  );
};

export default memo(HistoryToolBar);
