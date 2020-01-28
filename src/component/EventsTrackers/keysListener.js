import { useCallback, useEffect } from 'react';

import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { SET_KEY_PREFERENCES, APPLY_KEY_PREFERENCES } from '../reducer/Actions';

const KeyListener = () => {
  const { keysPreferences } = useChartData();
  const dispatch = useDispatch();

  const handleOnKeyPressed = useCallback(
    (e) => {
      if (
        e.target.localName !== 'input' &&
        e.keyCode >= 49 &&
        e.keyCode <= 57
      ) {
        if (e.shiftKey) {
          dispatch({
            type: SET_KEY_PREFERENCES,
            keyCode: e.keyCode,
          });
        } else {
          if (keysPreferences && keysPreferences[e.keyCode]) {
            dispatch({
              type: APPLY_KEY_PREFERENCES,
              keyCode: e.keyCode,
            });
          } else {
            dispatch({
              type: SET_KEY_PREFERENCES,
              keyCode: e.keyCode,
            });
          }
        }
      }
    },
    [keysPreferences, dispatch],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleOnKeyPressed, false);
    return () => {
      document.removeEventListener('keydown', handleOnKeyPressed, false);
    };
  }, [handleOnKeyPressed]);

  return null;
};

export default KeyListener;
