import { useCallback, useEffect } from 'react';
import { useAlert } from 'react-alert';

import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { useGlobal } from '../context/GlobalContext';
import {
  SET_KEY_PREFERENCES,
  APPLY_KEY_PREFERENCES,
} from '../reducer/types/Types';

function isModifierKeyActivated(event) {
  const modifiersKeys = [
    'Alt',
    'AltGraph',
    'CapsLock',
    'Control',
    'Meta',
    'NumLocK',
    'ScrollLock',
    'Shift',
    'OS',
  ];
  for (const key of modifiersKeys) {
    if (event.getModifierState(key)) {
      return true;
    }
  }
  return false;
}

const KeyListener = () => {
  const { keysPreferences } = useChartData();
  const { isRootFocus, rootRef } = useGlobal();
  const dispatch = useDispatch();
  const alert = useAlert();

  const handleOnKeyPressed = useCallback(
    (e) => {
      if (
        !['input', 'textarea'].includes(e.target.localName) &&
        e.keyCode >= 49 &&
        e.keyCode <= 57
      ) {
        if (isRootFocus) {
          if (e.shiftKey) {
            dispatch({
              type: SET_KEY_PREFERENCES,
              keyCode: e.keyCode,
            });
            alert.show(
              `Configuration Reset, press '${String.fromCharCode(
                e.keyCode,
              )}' again to reload it.`,
            );
          } else {
            if (!isModifierKeyActivated(e)) {
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
                alert.show(
                  `Configuration saved, press '${e.key}' again to reload it.`,
                );
              }
            }
          }
        } else {
          alert.show(
            'The mouse cursor must be over the NMR displayer to use save configuration shortcuts  ',
          );
        }
      }
    },
    [isRootFocus, dispatch, alert, keysPreferences],
  );

  useEffect(() => {
    if (rootRef) {
      rootRef.addEventListener('keydown', handleOnKeyPressed, false);
    }
    return () => {
      if (rootRef) {
        rootRef.removeEventListener('keydown', handleOnKeyPressed, false);
      }
    };
  }, [handleOnKeyPressed, rootRef]);

  return null;
};

export default KeyListener;
