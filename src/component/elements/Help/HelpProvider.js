/* eslint-disable no-unused-vars */
import React, {
  useReducer,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';

import { HelpProvider as HProvider } from './Context';
import { helpReducer, initState } from './HelpReducer';

const styles = {
  outerContainer: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(255,255,255,0)',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    zIndex: 0,
  },
  innerContainer: {
    marginTop: '20px',
    marginRight: '20px',
    boxSizing: 'initial',
    backgroundColor: '#fff',
    boxShadow: '0 0 0 0, 0 8px 16px rgba(0,0,0,.30)',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '300px',
    minHeight: '140px',
    justifyContent: 'space-between',
    borderRadius: '5px',
    padding: '10px',
  },
};

const HelpProvider = ({ children, data }) => {
  const root = useRef();

  useEffect(() => {
    root.current = document.createElement('div');
    document.body.appendChild(root.current);

    return () => {
      if (root.current) document.body.removeChild(root.current);
    };
  }, []);

  const [helpState, dispatch] = useReducer(helpReducer, { ...initState, data });
  const contextValue = useMemo(() => ({ helpState, dispatch }), [helpState]);

  //   const closeHandler = useCallback(() => {
  //     document.body.removeChild(root.current);
  //   }, []);

  return (
    <HProvider value={contextValue}>
      {children}
      {/* {root.current &&
        createPortal(
          <div style={styles.outerContainer}>
            <div style={styles.innerContainer}>
              <div>
                <button type="button" onClick={closeHandler}>
                  X
                </button>
              </div>
              <div>help</div>
            </div>
          </div>,
          root.current,
        )} */}
    </HProvider>
  );
};

export default HelpProvider;
