import { Fragment, useCallback, memo } from 'react';
import { FaUndo, FaRedo } from 'react-icons/fa';

import { ChartContext, useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import ToolTip from '../elements/ToolTip/ToolTip';
import { REDO, UNDO } from '../reducer/HistoryActions';

const styles = {
  button: {
    backgroundColor: 'transparent',
    border: 'none',
    width: '35px',
    height: '35px',
    minHeight: '35px',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'outline',
  },
};

function HistoryToolBar({
  isUndoButtonVisible = true,
  isRedoButtonVisible = true,
}) {
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
        <button
          style={styles.button}
          type="button"
          onClick={handleRedo}
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
          onClick={handleUndo}
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
