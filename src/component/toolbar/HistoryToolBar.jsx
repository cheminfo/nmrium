import React, { Fragment, useCallback, memo, useContext } from 'react';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import { FaUndo, FaRedo } from 'react-icons/fa';

import { useDispatch } from '../context/DispatchContext';
import { REDO, UNDO } from '../reducer/HistoryActions';
import { ChartContext } from '../context/ChartContext';

const HistoryToolBar = ({
  isUndoButtonVisible = true,
  isRedoButtonVisible = true,
}) => {
  const { history } = useContext(ChartContext);

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
        <Tooltip title="Redo" placement="right-start">
          <Button
            className="general-fun-bt"
            onClick={handleRedo}
            disabled={!history.hasRedo}
          >
            <FaRedo />
          </Button>
        </Tooltip>
      )}
      {isRedoButtonVisible && (
        <Tooltip title="Undo" placement="right-start">
          <Button
            className="general-fun-bt"
            onClick={handleUndo}
            disabled={!history.hasUndo}
          >
            <FaUndo />
          </Button>
        </Tooltip>
      )}
    </Fragment>
  );
};

export default memo(HistoryToolBar);
