import {
  useRef,
  useEffect,
  useCallback,
  Fragment,
  useState,
  memo,
  useMemo,
  CSSProperties,
  ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import { Rnd } from 'react-rnd';
import { TransitionGroup } from 'react-transition-group';

import { helpList } from '../../../../constants';
import Transition from '../Transition';
import Wrapper from '../Wrapper';
import { groupBy } from '../helpers';
import { positions, transitions } from '../options';

import { HelpProvider } from './Context';

const transitionStyles: any = {
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

const styles: Record<
  'innerContainer' | 'outerContainer' | 'closeButton',
  CSSProperties
> = {
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

const defaultContainerStyle = {
  zIndex: 100,
};

interface ProviderProps {
  children: ReactNode;
  offset?: string;
  position?: string;
  timeout?: number;
  delay?: number;
  type?: string;
  transition?: any;
  containerStyle?: CSSProperties;
  wrapperRef?: any;
  multiple?: boolean;
  preventAutoHelp?: boolean;
}

function Provider({
  children,
  offset = '10px',
  position = positions.TOP_RIGHT,
  timeout = 0,
  delay = 2000,
  type,
  transition = transitions.SCALE,
  containerStyle = defaultContainerStyle,
  wrapperRef = null,
  multiple = false,
  preventAutoHelp = false,
}: ProviderProps) {
  const root = useRef<any>();
  const timersId = useRef<any>([]);
  const [modals, setModals] = useState<any[]>([]);
  const timeoutRef = useRef<any>();

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
          const id = Math.random().toString(36).substr(2, 9);

          const modalOptions = {
            position: options.position || position,
            timeout,
            type,
            ...options,
          };

          const modal: any = {
            helpid,
            id,
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
            timeoutRef.current = setTimeout(
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
    [delay, modals, multiple, position, preventAutoHelp, remove, timeout, type],
  );

  const clear = useCallback(() => {
    clearTimeout(timeoutRef.current);
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

  const modalsByPosition = groupBy(modals, (modal) => modal.options?.position);

  const [helpText, setHelpText] = useState(null);

  const helpContextValue = useMemo(
    () => ({ helpText, setHelpText, show, clear, preventAutoHelp }),
    [helpText, setHelpText, show, clear, preventAutoHelp],
  );

  return (
    <HelpProvider value={helpContextValue}>
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
                              {helpList[modal.helpid].url && (
                                <div
                                  style={{
                                    cursor: 'default',
                                    width: '100%',
                                    height: '100%',
                                  }}
                                >
                                  <iframe
                                    title="Tool User Manual"
                                    src={helpList[modal.helpid].url}
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

export default memo(Provider);
