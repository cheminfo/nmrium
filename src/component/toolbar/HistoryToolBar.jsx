import React, { Fragment, useCallback, memo } from 'react';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import { FaUndo, FaRedo } from 'react-icons/fa';
import { useDispatch } from '../context/DispatchContext';
import { REDO, UNDO } from '../reducer/HistoryActions';

const HistoryToolBar = ({
  history,
  isUndoButtonVisible = true,
  isRedoButtonVisible = true,
}) => {
  const dispatch = useDispatch();
  const handleRedo = useCallback(
    (e) =>
      dispatch({
        type: REDO,
      }),
    [dispatch],
  );
  const handleUndo = useCallback(
    (e) =>
      dispatch({
        type: UNDO,
      }),
    [dispatch],
  );

  return (
    <Fragment>
      {isUndoButtonVisible && (
        <Tooltip title="Redo" placement="right-start">
          {/* component="div" */}

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
