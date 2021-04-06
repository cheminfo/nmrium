import {
  useReducer,
  useRef,
  useEffect,
  useCallback,
  Fragment,
  useState,
  memo,
  useMemo,
} from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import { Rnd } from 'react-rnd';
import { TransitionGroup } from 'react-transition-group';

import Transition from '../Transition';
import Wrapper from '../Wrapper';
import { groupBy } from '../helpers';
import { positions, transitions } from '../options';
import { load } from '../utility';

import { HelpProvider } from './Context';
import helpReducer, { initState } from './Reducer';

const transitionStyles = {
  [transitions.FADE]: {
    entering: { opacity: 0 },
    entered: { opacity: 1 },
  },
  [transitions.SCALE]: {
    entering: { transform: 'scale(0)' },
    entered: { transform: 'scale(1)' },
    exiting: { transform: 'scale(0)' },
    exited: { transform: 'scale(0)' },
  },
};

const styles = {
  innerContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    borderRadius: '5px',
    padding: '10px',
  },
  outerContainer: {
    boxSizing: 'initial',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    boxShadow: '0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 3px 5px',
    pointerEvents: 'all',
  },
  closeButton: {
    border: 'none',
    color: 'red',
    backgroundColor: 'transparent',
    outline: 'none',
  },
};

let dealyTimeOut = null;

function Provider({
  children,
  data,
  offset,
  position,
  timeout,
  delay,
  type,
  transition,
  containerStyle,
  wrapperRef,
  multiple,
  preventAutoHelp,
}) {
  const root = useRef();
  const timersId = useRef([]);
  const [modals, setModals] = useState([]);

  useEffect(() => {
    root.current = document.createElement('div');
    const ref = root.current;
    if (wrapperRef) {
      wrapperRef.appendChild(ref);
    }

    const timersIdRef = timersId.current;

    return () => {
      timersIdRef.forEach(clearTimeout);
      if (wrapperRef) {
        wrapperRef.removeChild(ref);
      }
    };
  }, [wrapperRef]);

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
    async (helpid, options = { delay: null }) => {
      if (!modals.some((m) => m.helpid === helpid)) {
        try {
          const mdtext = await load(data[helpid].filePath);

          const id = Math.random().toString(36).substr(2, 9);

          const modalOptions = {
            position: options.position || position,
            timeout,
            type,
            ...options,
          };

          const modal = {
            helpid,
            id,
            mdtext,
            options: modalOptions,
          };

          modal.close = () => remove(modal);

          const startModal = () => {
            if (modal.options.timeout) {
              const timerId = setTimeout(() => {
                remove(modal);
                timersId.current.splice(timersId.current.indexOf(timerId), 1);
              }, modal.options.timeout);

              timersId.current.push(timerId);
            }

            setModals((state) => (multiple ? state.concat(modal) : [modal]));

            if (modal.options.onOpen) modal.options.onOpen();
          };

          if (options.delay === 0) {
            startModal();
          } else if (!preventAutoHelp) {
            dealyTimeOut = setTimeout(
              () => {
                startModal();
              },
              options.delay > 0 ? options.delay : delay,
            );
          }
          return modal;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log(e);
        }
      }
    },
    [
      data,
      delay,
      modals,
      multiple,
      position,
      preventAutoHelp,
      remove,
      timeout,
      type,
    ],
  );

  const clear = useCallback(() => {
    clearTimeout(dealyTimeOut);
  }, []);

  const parentStyle = useMemo(() => {
    return wrapperRef
      ? wrapperRef.getBoundingClientRect()
      : {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
  }, [wrapperRef]);

  const [helpState, dispatch] = useReducer(helpReducer, {
    ...initState,
    data,
  });

  const modalsByPosition = groupBy(
    modals,
    (modal) => modal.options && modal.options.position,
  );

  return (
    <HelpProvider value={{ helpState, dispatch, show, clear }}>
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
                  containerStyle={parentStyle}
                  component={Wrapper}
                >
                  {modalsByPosition[_position]
                    ? modalsByPosition[_position].map((modal) => (
                        <Transition
                          type={transition}
                          key={modal.id}
                          transitionStyles={{
                            ...transitionStyles,
                            default: { width: '400px', height: '400px' },
                          }}
                        >
                          <Rnd
                            style={{
                              margin: offset,
                              ...styles.outerContainer,
                            }}
                            default={{
                              x: 0,
                              y: 0,
                              width: 400,
                              height: 400,
                            }}
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
                              {modal.mdtext && (
                                <div
                                  style={{
                                    cursor: 'default',
                                    width: '100%',
                                    height: '100%',
                                  }}
                                >
                                  <iframe
                                    title="Tool User Manual"
                                    src={data[modal.helpid].filePath}
                                    frameBorder="0"
                                    scrolling="auto"
                                    style={{ width: '100%', height: '100%' }}
                                  />
                                </div>
                              )}
                            </div>
                          </Rnd>
                        </Transition>
                      ))
                    : null}
                </TransitionGroup>
              );
            })}
          </Fragment>,
          root.current,
        )}
    </HelpProvider>
  );
}

Provider.defaultProps = {
  offset: '10px',
  position: positions.TOP_RIGHT,
  timeout: 0,
  delay: 2000,
  transition: transitions.SCALE,
  containerStyle: {
    zIndex: 100,
  },
  wrapperRef: null,
  multiple: false,
  preventAutoHelp: false,
};

export default memo(Provider);
