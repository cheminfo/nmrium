import groupBy from 'lodash/groupBy';
import {
  Fragment,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  memo,
  CSSProperties,
  ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import { TransitionGroup } from 'react-transition-group';

import Transition from '../Transition';
import Wrapper from '../Wrapper';
import { positions, transitions, types } from '../options';

import { AlertProvider } from './Context';
import ProgressIndicator from './ProgressIndicator';

interface ProviderProps {
  children: ReactNode;
  offset?: string;
  position?: any;
  timeout?: number;
  type?: any;
  transition?: any;
  containerStyle?: CSSProperties;
  wrapperRef?: any;
  context?: {
    Provider?: any;
    Consumer?: any;
  };
}

function Provider({
  children,
  wrapperRef = null,
  offset = '5px',
  position = positions.BOTTOM_CENTER,
  timeout = 3000,
  type,
  transition = transitions.FADE,
  ...props
}: ProviderProps) {
  const root = useRef<any>(null);
  const timersId = useRef<any>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    root.current = document.createElement('div');
    const ref = root.current;
    const timersIdRef = timersId.current;

    if (wrapperRef) {
      wrapperRef.appendChild(ref);
    }
    return () => {
      if (ref) {
        if (wrapperRef) {
          timersIdRef.forEach(clearTimeout);

          wrapperRef.removeChild(ref);
        }
      }
    };
  }, [wrapperRef]);

  const remove = useCallback((alert) => {
    setAlerts((currentAlerts) => {
      const lengthBeforeRemove = currentAlerts.length;
      const filteredAlerts = currentAlerts.filter((a) => a.id !== alert.id);

      if (lengthBeforeRemove > filteredAlerts.length && alert.options.onClose) {
        alert.options.onClose();
      }

      return filteredAlerts;
    });
  }, []);

  const show = useCallback(
    (message = '', options: any = {}) => {
      const id = Math.random().toString(36).substring(2, 9);

      const alertOptions = {
        position: options.position || position,
        timeout,
        type,
        backgroundColor: 'black',
        color: 'white',
        ...options,
      };

      const alert: any = {
        id,
        message,
        options: alertOptions,
      };

      alert.close = () => remove(alert);

      if (alert.options.timeout) {
        const timerId = setTimeout(() => {
          remove(alert);

          timersId.current.splice(timersId.current.indexOf(timerId), 1);
        }, alert.options.timeout);

        timersId.current.push(timerId);
      }

      setAlerts((state) => state.concat(alert));
      if (alert.options.onOpen) alert.options.onOpen();

      return alert;
    },
    [position, remove, timeout, type],
  );

  const success = useCallback(
    (message = '', options: any = {}) => {
      options.type = types.SUCCESS;
      options = { backgroundColor: '#28ba62', color: 'white', ...options };

      return show(message, options);
    },
    [show],
  );

  const error = useCallback(
    (message = '', options: any = {}) => {
      options.type = types.ERROR;
      options = { backgroundColor: '#cf3c4f', color: 'white', ...options };
      return show(message, options);
    },
    [show],
  );

  const info = useCallback(
    (message = '', options: any = {}) => {
      options.type = types.INFO;
      options.color = '#28ba62';
      return show(message, options);
    },
    [show],
  );

  const showLoading = useCallback(
    (message = 'Process in progress', options: any = {}) => {
      options.type = types.PROGRESS_INDICATOR;
      options.timeout = 0;
      options.backgroundColor = '#232323';

      return new Promise((resolve) => {
        const alert = show(message, options);
        setTimeout(() => {
          resolve(() => remove(alert));
        }, 500);
      });
    },
    [remove, show],
  );

  const closeHandler = useCallback(
    (alert) => {
      remove(alert);
    },
    [remove],
  );

  const alertsByPosition = groupBy(alerts, (alert) => alert.options.position);

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

  const alertContextValue = useMemo(
    () => ({ show, success, error, info, showLoading }),
    [show, success, error, info, showLoading],
  );

  return (
    <AlertProvider value={alertContextValue}>
      {children}
      {root.current &&
        createPortal(
          <Fragment>
            {Object.keys(positions).map((key) => {
              const position = positions[key];

              return (
                <TransitionGroup
                  appear
                  key={position}
                  options={{ position, zIndex: 999999 }}
                  component={Wrapper}
                  containerStyle={parentStyle}
                  {...props}
                >
                  {alertsByPosition[position]
                    ? alertsByPosition[position].map((alert) => (
                        <Transition type={transition} key={alert.id}>
                          <div
                            style={{
                              margin: offset,
                              padding: '25px',
                              borderRadius: '10px',
                              pointerEvents: 'all',
                              backgroundColor: alert.options.backgroundColor,
                              color: alert.options.color,
                              minHeight: '60px',
                              position: 'relative',
                            }}
                            key={alert.id}
                          >
                            <button
                              style={{
                                position: 'absolute',
                                right: '5px',
                                top: '5px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: 'white',
                              }}
                              type="button"
                              onClick={() => closeHandler(alert)}
                            >
                              <FaTimes />
                            </button>

                            <span>{alert.message}</span>
                            {alert.options.type ===
                              types.PROGRESS_INDICATOR && <ProgressIndicator />}
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
    </AlertProvider>
  );
}

export default memo(Provider);
