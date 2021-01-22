import { useCallback } from 'react';

import checkModifierKeyActivated from '../../data/utilities/checkModifierKeyActivated';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { useAlert } from '../elements/popup/Alert';
import {
  SET_KEY_PREFERENCES,
  APPLY_KEY_PREFERENCES,
} from '../reducer/types/Types';

const KeysListenerTracker = ({ children }) => {
  const { keysPreferences } = useChartData();
  const dispatch = useDispatch();
  const alert = useAlert();

  const keyPressHandler = useCallback(
    (e) => {
      const num = Number(e.code.substr(e.code.length - 1)) || 0;
      if (
        !['input', 'textarea'].includes(e.target.localName) &&
        num >= 1 &&
        num <= 9
      ) {
        if (e.shiftKey) {
          dispatch({
            type: SET_KEY_PREFERENCES,
            keyCode: num,
          });
          alert.show(`Configuration Reset, press '${num}' again to reload it.`);
        } else {
          if (!checkModifierKeyActivated(e)) {
            if (keysPreferences && keysPreferences[num]) {
              dispatch({
                type: APPLY_KEY_PREFERENCES,
                keyCode: num,
              });
            } else {
              dispatch({
                type: SET_KEY_PREFERENCES,
                keyCode: num,
              });
              alert.show(
                `Configuration saved, press '${num}' again to reload it.`,
              );
            }
          }
        }
      }
    },
    [alert, dispatch, keysPreferences],
  );
  const mouseEnterHandler = useCallback((e) => {
    e.currentTarget.focus();
  }, []);

  return (
    <div
      onKeyPress={keyPressHandler}
      onMouseEnter={mouseEnterHandler}
      tabIndex="0"
      style={{ width: 'inherit', height: 'inherit' }}
    >
      {children}
    </div>
  );
};

export default KeysListenerTracker;
