import React, { Fragment, useCallback, memo } from 'react';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import { FaUndo, FaRedo } from 'react-icons/fa';

import { useDispatch } from '../context/DispatchContext';
import { REDO, UNDO } from '../reducer/HistoryActions';
import { ChartContext, useChartData } from '../context/ChartContext';
import ToolTip from '../elements/ToolTip/ToolTip';

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
          <Button
            className="general-fun-bt"
            onClick={handleRedo}
            disabled={!history.hasRedo}
          >
            <FaRedo />
          </Button>
        </ToolTip>
      )}
      {isRedoButtonVisible && (
        <ToolTip title="Undo" popupPlacement="right">
          <Button
            className="general-fun-bt"
            onClick={handleUndo}
            disabled={!history.hasUndo}
          >
            <FaUndo />
          </Button>
        </ToolTip>
      )}
    </Fragment>
  );
};

export default memo(HistoryToolBar);
