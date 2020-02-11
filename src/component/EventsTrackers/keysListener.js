import { useCallback, useEffect } from 'react';
import { useAlert } from 'react-alert';

import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { SET_KEY_PREFERENCES, APPLY_KEY_PREFERENCES } from '../reducer/Actions';

let isMouseOver = false;

const KeyListener = ({ parentRef }) => {
  const { keysPreferences } = useChartData();
  const dispatch = useDispatch();
  const alert = useAlert();

  const handleOnKeyPressed = useCallback(
    (e) => {
      if (isMouseOver) {
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
            alert.show('Configuration Reset');
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
              alert.show('Configuration saved');
            }
          }
        }
      } else {
        alert.show(
          'The mouse cursor must be over the NMR displayer to use save configuration shortcuts  ',
        );
      }
    },
    [dispatch, keysPreferences, alert],
  );
  const handleMouseEnter = useCallback(() => {
    isMouseOver = true;
  }, []);
  const handleMouseLeave = useCallback(() => {
    isMouseOver = false;
  }, []);
  useEffect(() => {
    const element = parentRef ? parentRef.current : null;

    if (parentRef) {
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseEnter, handleMouseLeave, parentRef]);

  useEffect(() => {
    // ReactDOM.findDOMNode(parentRef.current)

    document.addEventListener('keydown', handleOnKeyPressed, false);
    return () => {
      document.removeEventListener('keydown', handleOnKeyPressed, false);
    };
  }, [handleOnKeyPressed]);

  return null;
};

export default KeyListener;
