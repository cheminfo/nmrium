import React, { Fragment } from 'react';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import { FaUndo, FaRedo } from 'react-icons/fa';

const HistoryToolBar = ({
  history,
  onUndo,
  onRedo,
  isUndoButtonVisible = true,
  isRedoButtonVisible = true,

}) => {
  return (
    <Fragment>
      {isUndoButtonVisible && (
        <Tooltip title="Redo" placement="right-start">
          {/* component="div" */}

          <Button
            className="general-fun-bt"
            onClick={onRedo}
            disabled={!history.hasRedo}
          >
            <FaRedo />
          </Button>
        </Tooltip>
      )}
      {isRedoButtonVisible && (
        <Tooltip title="Undo" placement="right-start">
          {/* component="div" */}
          <Button
            className="general-fun-bt"
            onClick={onUndo}
            disabled={!history.hasUndo}
          >
            <FaUndo />
          </Button>
        </Tooltip>
      )}

    </Fragment>
  );
};

export default HistoryToolBar;
