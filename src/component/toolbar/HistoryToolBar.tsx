import { Fragment, useCallback, memo } from 'react';
import { FaUndo, FaRedo } from 'react-icons/fa';

import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import ToolTip from '../elements/ToolTip/ToolTip';
import { REDO, UNDO } from '../reducer/types/HistoryTypes';

const styles = {
  button: {
    backgroundColor: 'transparent',
    border: 'none',
    width: '30px',
    height: '30px',
    minHeight: '30px',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'outline',
  },
};

interface HistoryToolBarProps {
  isUndoButtonVisible?: boolean;
  isRedoButtonVisible?: boolean;
}

function HistoryToolBar({
  isUndoButtonVisible = true,
  isRedoButtonVisible = true,
}: HistoryToolBarProps) {
  const { history } = useChartData();
  const dispatch = useDispatch();

  const handle = useCallback(
    (type: typeof REDO | typeof UNDO) => dispatch({ type }),
    [dispatch],
  );

  return (
    <Fragment>
      {isUndoButtonVisible && (
        <button
          style={styles.button}
          type="button"
          onClick={() => handle(REDO)}
          disabled={!history.hasRedo}
        >
          <ToolTip title="Redo" popupPlacement="right">
            <FaRedo />
          </ToolTip>
        </button>
      )}
      {isRedoButtonVisible && (
        <button
          type="button"
          style={styles.button}
          onClick={() => handle(UNDO)}
          disabled={!history.hasUndo}
        >
          <ToolTip title="Undo" popupPlacement="right">
            <FaUndo />
          </ToolTip>
        </button>
      )}
    </Fragment>
  );
}

export default memo(HistoryToolBar);
