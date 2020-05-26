/* eslint-disable no-unused-vars */
import React, {
  useReducer,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  Fragment,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import { TransitionGroup } from 'react-transition-group';

import { HelpProvider as HProvider } from './Context';
import { helpReducer, initState } from './HelpReducer';
import Transition from './Transition';
import Wrapper from './Wrapper';
import { groupBy } from './helpers';
import { positions, transitions } from './options';

const styles = {
  innerContainer: {
    boxSizing: 'initial',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    boxShadow: '0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 3px 5px',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '300px',
    minHeight: '140px',
    borderRadius: '5px',
    padding: '5px',
  },
  closeButton: {
    border: 'none',
    color: 'red',
    backgroundColor: 'transparent',
    outline: 'none',
  },
};

let dealyTimeOut = null;

const HelpProvider = ({
  children,
  data,
  offset,
  position,
  timeout,
  delay,
  type,
  transition,
  containerStyle,
}) => {
  const root = useRef();
  const timersId = useRef([]);
  const [modals, setModals] = useState([]);

  useEffect(() => {
    root.current = document.createElement('div');
    document.body.appendChild(root.current);

    const timersIdRef = timersId.current;

    return () => {
      timersIdRef.forEach(clearTimeout);
      if (root.current) document.body.removeChild(root.current);
    };
  }, []);

  const remove = useCallback((modal) => {
    setModals((currentModals) => {
      const lengthBeforeRemove = currentModals.length;
      const filteredModals = currentModals.filter((a) => a.id !== modal.id);

      if (lengthBeforeRemove > filteredModals.length && modal.options.onClose) {
        modal.options.onClose();
      }

      return filteredModals;
    });
  }, []);

  const show = useCallback(
    (helpID, options = {}) => {
      const id = Math.random().toString(36).substr(2, 9);

      const modalOptions = {
        position: options.position || position,
        timeout,
        type,
        ...options,
      };

      const modal = {
        id,
        ...data[helpID],
        options: modalOptions,
      };

      modal.close = () => remove(modal);

      dealyTimeOut = setTimeout(() => {
        if (modal.options.timeout) {
          const timerId = setTimeout(() => {
            remove(modal);
            timersId.current.splice(timersId.current.indexOf(timerId), 1);
          }, modal.options.timeout);

          timersId.current.push(timerId);
        }

        setModals((state) => state.concat(modal));
        if (modal.options.onOpen) modal.options.onOpen();
      }, delay);

      return modal;
    },
    [data, delay, position, remove, timeout, type],
  );

  const clear = useCallback(() => {
    clearTimeout(dealyTimeOut);
  }, []);

  const [helpState, dispatch] = useReducer(helpReducer, { ...initState, data });
  const contextValue = useMemo(() => ({ helpState, dispatch, show, clear }), [
    clear,
    helpState,
    show,
  ]);

  const modalsByPosition = groupBy(
    modals,
    (modal) => modal.options && modal.options.position,
  );

  return (
    <HProvider value={contextValue}>
      {children}
      {root.current &&
        createPortal(
          <Fragment>
            {Object.keys(positions).map((key) => {
              const _position = positions[key];

              return (
                <TransitionGroup
                  appear
                  key={_position}
                  options={{ position, containerStyle }}
                  component={Wrapper}
                >
                  {modalsByPosition[_position]
                    ? modalsByPosition[_position].map((modal) => (
                        <Transition type={transition} key={modal.id}>
                          <div
                            style={{ margin: offset, pointerEvents: 'all' }}
                            {...modal}
                          >
                            <div style={styles.innerContainer}>
                              <div>
                                <button
                                  type="button"
                                  onClick={() => remove(modal)}
                                  style={styles.closeButton}
                                >
                                  <FaTimes />
                                </button>
                              </div>
                              <div>
                                {modal.imageURL && (
                                  <img src={modal.imageURL} alt={modal.text} />
                                )}
                              </div>
                            </div>
                          </div>
                        </Transition>
                      ))
                    : null}
                </TransitionGroup>
              );
            })}
          </Fragment>,
          root.current,
        )}
    </HProvider>
  );
};

HelpProvider.defaultProps = {
  offset: '10px',
  position: positions.TOP_RIGHT,
  timeout: 0,
  delay: 2000,
  transition: transitions.SCALE,
  containerStyle: {
    zIndex: 100,
  },
};

export default HelpProvider;
